import yaml from "js-yaml";

import { IExecutionContext } from "../../i-execution-context";
import { slf4tsLoggerFactory } from "../../logging/slf4ts/slf4ts-logger-factory";
import { validateOwnersYaml } from "../../validate-owners-yaml";

import { addTeamMember } from "./add-team-member";
import { createTeam } from "./create-team";
import { getFileContents } from "./get-file-contents";
import {
  getTeamsOfOrganization,
  IMemberNodeEntity,
  ITeamNodeEntity,
} from "./get-teams-of-organization";
import { IRepositoryOwners } from "./model/i-repository-owners";
import {
  IRepositoryOwnersDiff,
  ITeamMemberAddition,
  ITeamMemberRemoval,
} from "./model/i-repository-owners-diff";

export type ISyncOwnersRequest = {
  readonly organizationName: string;
  readonly repositoryName: string;
  readonly file?: string;
  readonly branch?: string;
};

/**
 * FIXME this will not work if there's more than a 100 teams in the GitHub org
 * because for that we need to handle pagination, which is something that we
 * don't do at all at the moment.
 * @param ctx
 * @param cmdArgs
 * @returns
 */
export async function syncOwners(
  ctx: IExecutionContext,
  req: ISyncOwnersRequest
): Promise<unknown> {
  const branch = req.branch || "main";
  const file = req.file || "OWNERS.yaml";

  const log = slf4tsLoggerFactory("syncOwners", ctx.argv);
  const request = {
    organizationName: req.organizationName,
    repositoryName: req.repositoryName,
    file,
    branch,
  };
  log.debug(`Fetching owners YAML: `, request);
  const ownersYamlContents = await getFileContents(ctx, request);
  log.debug(`owners YAML contents: `, ownersYamlContents);

  const ownersYamlRaw = yaml.load(ownersYamlContents) as IRepositoryOwners;
  log.debug(`owners YAML raw: `, ownersYamlRaw);

  const validationResult =  await validateOwnersYaml({ repositoryName: req.repositoryName, repositoryOwners: ownersYamlRaw });
  if (!validationResult.isValid) {
    throw new Error(`OWNERS.yaml is invalid: \n${validationResult.errors.join("\n")}`);
  }

  const repositoryOwners: IRepositoryOwners = {
    ...ownersYamlRaw,
    teams: ownersYamlRaw.teams.map((aTeam) => ({
      ...aTeam,
      members: aTeam.members || [],
    })),
  };
  log.debug(`owners YAML post-processed: `, repositoryOwners);

  const teamsInOrg = await getTeamsOfOrganization(ctx, req.organizationName);

  const diff = await determineDifferences(ctx, repositoryOwners, teamsInOrg);

  const teamsCreated = diff.teamsAdded.map(async (aTeamName) => {
    const team = repositoryOwners.teams.find((it) => it.name === aTeamName);
    if (!team) {
      throw new Error(`Added team not found in OWNERS.yaml: ${aTeamName}`);
    }
    const createTeamRequest = {
      org: req.organizationName,
      name: team.name,
      members: team.members,
      description: team.description,
      privacy: "closed",
      repo_names: [`${req.organizationName}/${req.repositoryName}`],
    };
    const createTeamResponse = await createTeam(ctx, createTeamRequest);

    return { createTeamResponse };
  });
  const teamCreationResponses = await Promise.all(teamsCreated);
  log.debug("Created {} teams successfully.", teamCreationResponses.length);

  const teamMembersAdded = await diff.membersAdditions.map(async (it) =>
    addTeamMember(ctx, {
      org: req.organizationName,
      name: it.teamName,
      members: [it.memberName],
    })
  );
  const teamMemberAdditionResponses = await Promise.all(teamMembersAdded);

  return {
    diff,
    responses: {
      teamCreation: teamCreationResponses,
      teamMemberAddition: teamMemberAdditionResponses,
    },
  };
}

async function determineDifferences(
  ctx: IExecutionContext,
  repositoryOwners: IRepositoryOwners,
  teamsInOrg: readonly ITeamNodeEntity[]
): Promise<IRepositoryOwnersDiff> {
  const log = slf4tsLoggerFactory("determineDifferences", ctx.argv);

  log.debug(`repositoryOwners: `, repositoryOwners);
  log.debug(`existingTeams: `, JSON.stringify(teamsInOrg, null, 4));

  const teamNamesInOrg = teamsInOrg.map((t) => t.name);
  const teamNamesInYaml = repositoryOwners.teams.map((t) => t.name);

  // The team names that are present in the OWNERS.yaml file but not in the org itself
  const teamsAdded = teamNamesInYaml.filter(
    (ty) => !teamNamesInOrg.includes(ty)
  );

  // Team names that are present in the org but not in the OWNERS.yaml file
  const teamsRemoved = teamNamesInOrg.filter(
    (to) => !teamNamesInYaml.includes(to)
  );

  const membersAdditions: readonly ITeamMemberAddition[] = repositoryOwners.teams
    .map((aTeam) =>
      aTeam.members
        .filter((aMember) => {
          return !teamsInOrg.some(
            (t) =>
              t.name === aTeam.name &&
              t.members.nodes?.some((m) => m?.login === aMember)
          );
        })
        .map((aMember) => {
          return {
            memberName: aMember,
            teamName: aTeam.name,
          } as ITeamMemberAddition;
        })
    )
    .flat();

  const membersRemovals: readonly ITeamMemberRemoval[] = teamsInOrg
    .filter((t) => Array.isArray(t.members.nodes))
    .map((aTeam) =>
      (aTeam.members.nodes as readonly IMemberNodeEntity[])
        .filter((aMember) => {
          return !repositoryOwners.teams.some(
            (t) => t.name === aTeam.name && t.members.includes(aMember.login)
          );
        })
        .map((aMember) => {
          return {
            memberName: aMember.login,
            teamName: aTeam.name,
          } as ITeamMemberRemoval;
        })
    )
    .flat();

  const diff: IRepositoryOwnersDiff = {
    membersAdditions,
    membersRemovals,
    teamsAdded,
    teamsRemoved,
  };

  return diff;
}
