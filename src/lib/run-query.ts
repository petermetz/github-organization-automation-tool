import { graphql } from "@octokit/graphql";
import { GraphQlResponse } from "@octokit/graphql/dist-types/types";

import { IExecutionContext } from "./i-execution-context";

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

  const log = await ctx.createLogger("runQuery", ctx);
  log.debug("Running GraphQL query:\n%o", query);

  return graphql({
    query,
    ...params, // FIXME validate against people using a param called "headers"
    headers: {
      authorization: `token ${ctx.accessToken}`,
    },
  });
}
