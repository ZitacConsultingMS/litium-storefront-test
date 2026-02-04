import { logs } from '@opentelemetry/api-logs';
import { Configuration } from '@vercel/otel';
import { forwardToOpenTelemetry } from 'instrumentation.logging';

export function config(): Configuration {
  return {};
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
};
