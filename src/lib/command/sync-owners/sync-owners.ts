import yaml from "js-yaml";

import { IExecutionContext } from "../../i-execution-context";

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
  cmdArgs: readonly string[]
): Promise<unknown> {
  const [organizationName, repositoryName, branchMaybe, fileMaybe] = cmdArgs;
  const branch = branchMaybe || "main";
  const file = fileMaybe || "OWNERS.yaml";

  const log = ctx.createLogger("syncOwners", ctx);
  const request = {
    organizationName,
    repositoryName,
    file,
    branch,
  };
  log.debug(`Fetching owners YAML: `, request);
  const ownersYamlContents = await getFileContents(ctx, request);
  log.debug(`owners YAML contents: `, ownersYamlContents);

  const repositoryOwners = yaml.load(ownersYamlContents) as IRepositoryOwners;
  log.debug(`owners YAML parsed: `, repositoryOwners);

  const teamsInOrg = await getTeamsOfOrganization(ctx, organizationName);

  return determineDifferences(ctx, repositoryOwners, teamsInOrg);
}

async function determineDifferences(
  ctx: IExecutionContext,
  repositoryOwners: IRepositoryOwners,
  teamsInOrg: readonly ITeamNodeEntity[]
): Promise<IRepositoryOwnersDiff> {
  const log = ctx.createLogger("determineDifferences", ctx);

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
