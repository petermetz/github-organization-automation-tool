import {
  ILoggerInstance,
  LoggerConfiguration,
  LoggerFactory,
  LogLevel,
} from "slf4ts-api";

import { NPM_PACKAGE_VERSION, PROJECT_NAME_SHORT } from "../../constants";
import type { IGlobalYargsOptions } from "../../main";

export function slf4tsLoggerFactory(
  label: string,
  argv: IGlobalYargsOptions
): ILoggerInstance<unknown> {
  const logLevel = mapToSlf4TsLogLevel(argv);

  const logger = LoggerFactory.getLogger(PROJECT_NAME_SHORT, label);

  LoggerConfiguration.setLogLevel(logLevel);

  logger.setMetadata({
    application: `${PROJECT_NAME_SHORT}-${NPM_PACKAGE_VERSION}`,
  });

  return logger;
}

export function mapToSlf4TsLogLevel(argv: IGlobalYargsOptions): LogLevel {
  if (argv.quiet) {
    // sets the log level of all loggers
    return LogLevel.ERROR;
  } else if (argv["log-level"]) {
    const logLevelName = argv["log-level"];
    return (LogLevel as never)[logLevelName] as LogLevel;
  } else if (argv.verbose === 1) {
    return LogLevel.DEBUG;
  } else if (argv.verbose >= 2) {
    return LogLevel.TRACE;
  } else {
    return LogLevel.WARN;
  }
}
