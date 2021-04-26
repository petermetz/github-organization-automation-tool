import { ILoggerFactory } from "./logging/i-logger-factory";

export type IExecutionContext = {
  readonly accessToken: string;
  readonly createLogger: ILoggerFactory;
};
