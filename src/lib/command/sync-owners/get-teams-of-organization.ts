import { IExecutionContext } from "../../i-execution-context";
import { runQuery } from "../../run-query";

/**
 * Example response in JSON
 *
 * ```json
 * {
 *   "data": {
 *     "organization": {
 *       "teams": {
 *         "edges": [
 *           {
 *             "node": {
 *               "name": "admin",
 *               "members": {
 *                 "totalCount": 1,
 *                 "nodes": [
 *                   {
 *                     "login": "petermetz"
 *                   }
 *                 ]
 *               }
 *             }
 *           },
 *           {
 *             "node": {
 *               "name": "maintain",
 *               "members": {
 *                 "totalCount": 0,
 *                 "nodes": []
 *               }
 *             }
 *           },
 *           {
 *             "node": {
 *               "name": "read",
 *               "members": {
 *                 "totalCount": 0,
 *                 "nodes": []
 *               }
 *             }
 *           },
 *           {
 *             "node": {
 *               "name": "the-test-team",
 *               "members": {
 *                 "totalCount": 1,
 *                 "nodes": [
 *                   {
 *                     "login": "petermetz"
 *                   }
 *                 ]
 *               }
 *             }
 *           },
 *           {
 *             "node": {
 *               "name": "triage",
 *               "members": {
 *                 "totalCount": 0,
 *                 "nodes": []
 *               }
 *             }
 *           },
 *           {
 *             "node": {
 *               "name": "write",
 *               "members": {
 *                 "totalCount": 0,
 *                 "nodes": []
 *               }
 *             }
 *           }
 *         ]
 *       }
 *     }
 *   }
 * }
 * ```
 */
export const GQL_GET_TEAMS_OF_ORGANIZATION = `
query ($organizationName: String!){
  organization(login: $organizationName) {
    teams(first: 100) {
      nodes {
        name,
        members {
          nodes {
            login
          }
        }
      }
    }
  }
}

`;

export async function getTeamsOfOrganization(
  ctx: IExecutionContext,
  organizationName: string
): Promise<readonly ITeamNodeEntity[]> {
  const { organization } = await runQuery<IOrganizationTeamInfo>(ctx, GQL_GET_TEAMS_OF_ORGANIZATION, { organizationName });
  const log = ctx.createLogger("getTeamsOfOrganization", ctx);
  log.debug(`Teams in org response: `, organization);
  if (Array.isArray(organization?.teams?.nodes)) {
    return organization.teams.nodes
  } else {
    return [];
  }
}

export type IOrganizationTeamInfo = {
  readonly organization: Organization;
};
export type Organization = {
  readonly teams: Teams;
};
export type Teams = {
  readonly nodes?: readonly (ITeamNodeEntity)[] | null;
};
export type ITeamNodeEntity = {
  readonly name: string;
  readonly members: Members;
};
export type Members = {
  readonly nodes?: readonly (IMemberNodeEntity | null)[] | null;
};
export type IMemberNodeEntity = {
  readonly login: string;
};
