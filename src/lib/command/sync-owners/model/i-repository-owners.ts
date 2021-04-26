import { IRepositoryTeam } from "./i-repository-team";

export type IRepositoryOwners = {
  readonly name: string,
  readonly description: string,
  readonly merge: readonly string[],
  readonly teams: ReadonlyArray<IRepositoryTeam>,
}
