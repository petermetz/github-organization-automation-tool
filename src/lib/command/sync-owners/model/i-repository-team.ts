export type IRepositoryTeam = {
  readonly name: string,
  readonly description: string,
  readonly 'github-role': string,
  readonly members: readonly string[],
}
