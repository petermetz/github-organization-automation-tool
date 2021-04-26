import figlet from "figlet";

import { listRepositories } from "./command/list-repositories";
import { renderCliHelpText } from "./command/render-cli-help-text";
import { syncOwners } from "./command/sync-owners/sync-owners";
import { PROJECT_NAME_LONG, PROJECT_NAME_SHORT } from "./constants";
import { IExecutionContext } from "./i-execution-context";
import { loglevelLoggerFactory } from "./logging/loglevel/loglevel-logger-factory";

export async function main(args: readonly string[], env: NodeJS.ProcessEnv = {}): Promise<void> {
  try {
    const greeting = await renderCliAppGreeting(PROJECT_NAME_SHORT);
    console.log(greeting);
    console.log(PROJECT_NAME_LONG);
    console.log();
  
    if (!env.GITHUB_TOKEN) {
      console.error(`ERROR: GITHUB_TOKEN environment variable needs to be set.`);
      process.exit(222);
    }
  
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_executable, _sourceFile, commandName, ...cmdArgs] = args;
    const ctx: IExecutionContext = {
      accessToken: env.GITHUB_TOKEN,
      createLogger: loglevelLoggerFactory,
    }
  
    const commandResponse = await invokeCommand(commandName, cmdArgs, ctx);
    console.log(JSON.stringify(commandResponse, null, 4));
  } catch (ex) {
    console.error(`Crashed with unknown exception:`, ex);
    process.exit(111);
  }
}

const invokeCommand = async(cmdName: string, cmdArgs: readonly string[], ctx: IExecutionContext): Promise<unknown> => {
  if (cmdName === "list") {
    return listRepositories(ctx, cmdArgs);
  } else if (cmdName === "sync-owners") {
    return syncOwners(ctx, cmdArgs);
  } else {
    return renderCliHelpText();
  }
}

const renderCliAppGreeting = (message: string): Promise<string> => {
  const fnTag = `renderCliAppGreeting()`;
  return new Promise((resolve, reject) => {
    figlet(message, (ex: Error | null, result?: string) => {
      if (ex) {
        console.error(`${fnTag} Figlet error: `, ex);
        reject(ex);
      } else if (result) {
        resolve(result);
      } else {
        reject(new Error(`${fnTag} Figlet: falsy result, no error`));
      }
    });
  });
};
