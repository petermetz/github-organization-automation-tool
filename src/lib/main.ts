import { LoggerConfiguration } from "slf4ts-api";
import { hideBin } from "yargs/helpers";
import yargs from "yargs/yargs";

import { listRepositories } from "./command/list-repositories";
import { syncOwners } from "./command/sync-owners/sync-owners";
import { IExecutionContext } from "./i-execution-context";
import {
  mapToSlf4TsLogLevel,
  slf4tsLoggerFactory,
} from "./logging/slf4ts/slf4ts-logger-factory";

export async function main(
  // eslint-disable-next-line functional/prefer-readonly-type
  args: string[],
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _env: NodeJS.ProcessEnv = {}
): Promise<void> {
  yargs(hideBin(args))
    .env("")
    .wrap(180)
    .option("github-token", {
      alias: "t",
      demandOption: true,
      type: "string",
      description: "The GitHub token to use for the API calls.",
    })
    .option("log-level", {
      alias: "l",
      choices: ["TRACE", "DEBUG", "INFO", "WARN", "ERROR"],
      type: "string",
      description:
        "The log level to use when logging. Ignored when quiet is specified.",
    })
    .option("verbose", {
      alias: "v",
      type: "count",
      description:
        "Run with verbose logging. Ignored if --quiet or --log-level is specified. Once: DEBUG, Twice: TRACE",
    })
    .option("quiet", {
      alias: "q",
      type: "boolean",
      description: "Only output errors or the final command result if any.",
    })
    .command(
      "list-repo [organizationName]",
      "Lists the git repositories within an organization",
      (yargs) => {
        return yargs.positional("organizationName", {
          describe: "The name of the GitHub organization",
          type: "string",
          demandOption: true,
          alias: "o",
        });
      },
      async (argv) => {
        const ctx = await initExecutionContext(argv);
        const commandResponse = await listRepositories(ctx, { ...argv });
        return { ctx, commandResponse };
      }
    )
    .command(
      "sync-owners [organizationName]",
      "Syncs the OWNERS.yaml file of a git repository to the organization.",
      (yargs) => {
        return yargs
          .positional("organizationName", {
            describe: "The name of the GitHub organization",
            type: "string",
            demandOption: true,
            alias: "o",
          })
          .positional("repositoryName", {
            describe: "The name of the GitHub git repository",
            type: "string",
            demandOption: true,
            alias: "o",
          });
      },
      async (argv) => {
        const ctx = await initExecutionContext(argv);
        const commandResponse = await syncOwners(ctx, { ...argv });
        return { ctx, commandResponse };
      }
    )
    .onFinishCommand(
      async (result: {
        readonly ctx: IExecutionContext;
        readonly commandResponse: unknown;
      }) => {
        const { commandResponse } = result;
        console.log(JSON.stringify(commandResponse, null, 4));
      }
    ).argv;
}

export type IGlobalYargsOptions = {
  readonly "github-token": string;
  readonly "log-level": string | undefined;
  readonly verbose: number;
  readonly quiet: boolean | undefined;
  readonly _: readonly (string | number)[];
  readonly $0: string;
};

const initExecutionContext = async (
  argv: IGlobalYargsOptions
): Promise<IExecutionContext> => {
  const logLevel = mapToSlf4TsLogLevel(argv);
  LoggerConfiguration.setDefaultLogLevel(logLevel);

  const rootLogger = slf4tsLoggerFactory("main", argv);
  const ctx: IExecutionContext = {
    accessToken: argv["github-token"],
    argv,
    rootLogger,
  };
  return ctx;
};
