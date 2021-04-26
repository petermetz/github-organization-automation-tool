export type ITeamMemberAddition = {
  readonly memberName: string;
  readonly teamName: string;
}

export type ITeamMemberRemoval = {
  readonly memberName: string;
  readonly teamName: string;
}

export type IRepositoryOwnersDiff = {
  readonly teamsAdded: readonly string[];
  readonly teamsRemoved: readonly string[];
  readonly membersAdditions: readonly ITeamMemberAddition[];
  readonly membersRemovals: readonly ITeamMemberRemoval[];
}
