import { IExecutionContext } from "../i-execution-context";
import { runQuery } from "../run-query";

import { IGithubRepository } from "./i-github-repository";

export const GQL_LIST_REPOSITORIES_BY_ORG_NAME = `
query ($orgName: String!) {
  organization(login: $orgName) {
    id
    name
    url
    repositories(first: 100) {
      nodes {
        id
        name
      }
    }
  }
}
`;

export async function listRepositories(
  ctx: IExecutionContext,
  cmdArgs: readonly string[]
): Promise<ReadonlyArray<IGithubRepository>> {
  const [orgName] = cmdArgs;
  const gql = GQL_LIST_REPOSITORIES_BY_ORG_NAME;
  const params = { orgName };
  return runQuery<never>(ctx, gql, params);
}
