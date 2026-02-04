import { logs } from '@opentelemetry/api-logs';
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import type { Instrumentation } from '@opentelemetry/instrumentation';
import { RuntimeNodeInstrumentation } from '@opentelemetry/instrumentation-runtime-node';
import {
  BatchLogRecordProcessor,
  LogRecordProcessor,
} from '@opentelemetry/sdk-logs';
import {
  MetricReader,
  PeriodicExportingMetricReader,
} from '@opentelemetry/sdk-metrics';
import { Configuration } from '@vercel/otel';
import { forwardToOpenTelemetry } from 'instrumentation.logging';

export function config(): Configuration {
  let logRecordProcessor: LogRecordProcessor | undefined = undefined;
  let metricReader: MetricReader | undefined = undefined;

  logRecordProcessor = new BatchLogRecordProcessor(new OTLPLogExporter());
  metricReader = new PeriodicExportingMetricReader({
    // exporter: new ConsoleMetricExporter(),
    exporter: new OTLPMetricExporter({
      url: `${process.env.OTEL_EXPORTER_OTLP_ENDPOINT}/v1/metrics`,
    }),
    exportIntervalMillis: 5000,
  });

  const instrumentations: (Instrumentation | undefined)[] = [
    new RuntimeNodeInstrumentation(),
  ];

  return {
    instrumentations,
    metricReader,
    logRecordProcessor,
  };
}

export const patch = function () {
  // Configure and setup forwarder for everything written to console or directly to process.stdout/stderr.
  const consoleLogger = logs.getLogger('console');

  // Patch console methods
  console.debug = forwardToOpenTelemetry(consoleLogger, 'DEBUG');
  console.error = forwardToOpenTelemetry(consoleLogger, 'ERROR');
  console.info = forwardToOpenTelemetry(consoleLogger, 'INFO');
  console.log = forwardToOpenTelemetry(consoleLogger, 'INFO');
  console.trace = forwardToOpenTelemetry(consoleLogger, 'TRACE');
  console.warn = forwardToOpenTelemetry(consoleLogger, 'WARN');

  const writeToConsole = false;

  // Patch process.stdout.write
  const originalStdoutWrite = process.stdout.write.bind(process.stdout);
  const stdoutLogger = forwardToOpenTelemetry(logs.getLogger('stdout'), 'INFO');
  process.stdout.write = function (
    chunk: string | Uint8Array,
    encoding?: BufferEncoding | ((err?: Error) => void),
    callback?: (err?: Error | null | undefined) => void
  ): boolean {
    stdoutLogger(chunk);
    return (
      (writeToConsole &&
        originalStdoutWrite(chunk, encoding as BufferEncoding, callback)) ||
      true
    );
  };

  // Patch process.stderr.write
  const originalStderrWrite = process.stderr.write.bind(process.stderr);
  const stderrLogger = forwardToOpenTelemetry(
    logs.getLogger('stderr'),
    'ERROR'
  );
  process.stderr.write = function (
    chunk: string | Uint8Array,
    encoding?: BufferEncoding | ((err?: Error) => void),
    callback?: (err?: Error | null | undefined) => void
  ): boolean {
    stderrLogger(chunk);
    return (
      (writeToConsole &&
        originalStderrWrite(chunk, encoding as BufferEncoding, callback)) ||
      true
    );
  };
};
