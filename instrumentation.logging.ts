import { LogRecord, Logger, SeverityNumber } from '@opentelemetry/api-logs';
import util from 'util';

const formatArgs = function (args: any[]) {
  return args
    .map((arg) => {
      if (typeof arg === 'object') {
        return util.inspect(arg, { depth: null, colors: false });
      }
      return String(arg);
    })
    .join(' ');
};

const logLayerLevels: Record<string, number> = {
  FATAL: SeverityNumber.FATAL,
  ERROR: SeverityNumber.ERROR,
  WARN: SeverityNumber.WARN,
  INFO: SeverityNumber.INFO,
  DEBUG: SeverityNumber.DEBUG,
  TRACE: SeverityNumber.TRACE,
};

function getSeverityNumber(level: string): SeverityNumber | undefined {
  return logLayerLevels[level];
}

function getNormalizeLevel(level: string): string {
  const uLevel = level.toUpperCase();
  switch (uLevel) {
    case 'FATAL':
    case 'ERROR':
    case 'WARN':
    case 'INFO':
    case 'DEBUG':
    case 'TRACE':
      return uLevel;
    default:
      return 'INFO';
  }
}

export const forwardToOpenTelemetry = function (logger: Logger, level: string) {
  const normalizedLevel = getNormalizeLevel(level);
  const secerityNumber = getSeverityNumber(normalizedLevel);
  return (...args: any[]) => {
    const message = formatArgs(args);
    const logRecord: LogRecord = {
      severityNumber: secerityNumber,
      severityText: normalizedLevel,
      body: message,
      attributes: {},
    };
    logger.emit(logRecord);
  };
};
