import { IExecutionContext } from "../i-execution-context";

import { ILogger } from "./i-logger";

export type ILoggerFactory = (label: string, ctx: IExecutionContext) => ILogger;
