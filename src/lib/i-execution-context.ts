import type { ILoggerInstance } from "slf4ts-api";

import type { IGlobalYargsOptions } from "./main";

export type IExecutionContext = {
  readonly argv: IGlobalYargsOptions;
  readonly rootLogger: ILoggerInstance<unknown>;
  readonly accessToken: string;
  readonly dryRun: boolean;
};
