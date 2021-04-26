import { ILogger } from "../i-logger";
import { ILoggerFactory } from "../i-logger-factory"

export const loglevelLoggerFactory: ILoggerFactory = (): ILogger => {
  const logger: ILogger = {
    trace: (message: string, meta: unknown) => Promise.resolve(console.log(message, meta)),
    debug: (message: string, meta: unknown) =>Promise.resolve( console.debug(message, meta)),
    info: (message: string, meta: unknown) => Promise.resolve(console.info(message, meta)),
    warn: (message: string, meta: unknown) => Promise.resolve(console.warn(message, meta)),
    error: (message: string, meta: unknown) => Promise.resolve(console.error(message, meta)),
  };
  return logger;
}
