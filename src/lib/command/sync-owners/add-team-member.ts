import { Octokit } from "@octokit/rest";
import type { OctokitResponse } from "@octokit/types";

import { IExecutionContext } from "../../i-execution-context";
import { slf4tsLoggerFactory } from "../../logging/slf4ts/slf4ts-logger-factory";

export type IAddTeamRequest = {
  readonly name: string;
  readonly org: string;
  readonly members: readonly string[];
};

export type IAddTeamResponse = {
  readonly githubResponses: readonly OctokitResponse<
    {
      readonly url: string;
      readonly role: "member" | "maintainer";
      readonly state: "active" | "pending";
    },
    200
  >[];
};

export async function addTeamMember(
  ctx: IExecutionContext,
  req: IAddTeamRequest
): Promise<IAddTeamResponse> {
  const LOG = slf4tsLoggerFactory("addTeamMember", ctx.argv);
  LOG.debug("Creating OctoKit...");
  const octokit = new Octokit({
    auth: ctx.accessToken,
  });

  LOG.debug("Sending request(s) to add members to created team...");
  const githubResponses = await Promise.all(
    req.members.map((m) =>
      octokit.teams.addOrUpdateMembershipForUserInOrg({
        org: req.org,
        team_slug: req.name,
        username: m,
      })
    )
  );
  LOG.debug(`Added ${req.members.length} team members`);

  return { githubResponses };
}
