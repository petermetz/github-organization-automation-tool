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

export type IListRepositoriesRequest = {
  readonly organizationName: string;
};

export async function listRepositories(
  ctx: IExecutionContext,
  req: IListRepositoriesRequest
): Promise<ReadonlyArray<IGithubRepository>> {
  const gql = GQL_LIST_REPOSITORIES_BY_ORG_NAME;
  const params = { orgName: req.organizationName };
  return runQuery<never>(ctx, gql, params);
}
