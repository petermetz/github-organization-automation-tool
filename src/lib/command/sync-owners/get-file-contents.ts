import { IExecutionContext } from "../../i-execution-context";
import { runQuery } from "../../run-query";

/**
 * Example parameters:
 * ```json
 * {
 *   "organizationName": "hyperledger",
 *   "repositoryName": "besu",
 *   "branchColonFilePath": "main:README.md"
 * }
 * ```
 */
export const GQL_GET_FILE_CONTENTS = `
query ($organizationName:String!, $repositoryName: String!, $branchColonFilePath: String!) {
  repository(name: $repositoryName, owner: $organizationName) {
    object(expression: $branchColonFilePath) {
      ... on Blob {
        text
      }
    }
  }
}
`;

export type IGetFileContentsResponse = {
  readonly repository: { readonly object: { readonly text: string } };
};

export type IGetFileContentsRequest = {
  readonly organizationName: string;
  readonly repositoryName: string;
  readonly branch: string;
  readonly file: string;
};

export async function getFileContents(
  ctx: IExecutionContext,
  request: IGetFileContentsRequest
): Promise<string> {
  const params = {
    organizationName: request.organizationName,
    repositoryName: request.repositoryName,
    branchColonFilePath: `${request.branch}:${request.file}`,
  };

  const { repository } = await runQuery<IGetFileContentsResponse>(
    ctx,
    GQL_GET_FILE_CONTENTS,
    params
  );

  const { object } = repository;
  const { text } = object;
  return text;
}
