import { Octokit } from "@octokit/rest";
import type { OctokitResponse } from "@octokit/types";

import { IExecutionContext } from "../../i-execution-context";
import { slf4tsLoggerFactory } from "../../logging/slf4ts/slf4ts-logger-factory";

export type ICreateTeamRequest = {
  readonly name: string;
  readonly org: string;
  readonly members: readonly string[];
};

export type ICreateTeamResponse = {
  readonly githubResponse: OctokitResponse<
    {
      readonly id: number;
      readonly node_id: string;
      readonly url: string;
      readonly html_url: string;
      readonly name: string;
      readonly slug: string;
      readonly description: string | null;
      readonly privacy?: "closed" | "secret" | undefined;
      readonly permission: string;
      readonly members_url: string;
      readonly ldap_dn?: string | undefined;
    },
    201
  >;
};

export async function createTeam(
  ctx: IExecutionContext,
  req: ICreateTeamRequest
): Promise<ICreateTeamResponse> {
  const LOG = slf4tsLoggerFactory("createTeam", ctx.argv);
  LOG.debug("Creating OctoKit...");
  const octokit = new Octokit({
    auth: ctx.accessToken,
  });
  LOG.debug("Sending request to create team ", { req });
  const githubResponse = await octokit.teams.create(req);

  return { githubResponse };
}
