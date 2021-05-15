import { graphql } from "@octokit/graphql";
import type { GraphQlResponse } from "@octokit/graphql/dist-types/types";

import type { IExecutionContext } from "./i-execution-context";
import { slf4tsLoggerFactory } from "./logging/slf4ts/slf4ts-logger-factory";

export async function runQuery<T>(
  ctx: IExecutionContext,
  query: string,
  params: Record<string, string | number>
): Promise<GraphQlResponse<T>> {
  if (params.headers) {
    throw new Error(`GraphQl query param "headers" is reserved.`);
  }
  if (params.headers) {
    throw new Error(`GraphQl query param "query" is reserved.`);
  }

  const log = await slf4tsLoggerFactory("runQuery", ctx.argv);
  log.debug("Running GraphQL query: ", query);

  return graphql({
    query,
    ...params, // FIXME validate against people using a param called "headers"
    headers: {
      authorization: `token ${ctx.accessToken}`,
    },
  });
}
