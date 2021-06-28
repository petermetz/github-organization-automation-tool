import { IRepositoryOwners } from "./command/sync-owners/model/i-repository-owners";

export type IValidateOwnersYamlRequest = {
  readonly repositoryName: string;
  readonly repositoryOwners: IRepositoryOwners;
};

export type IValidateOwnersYamlResponse = {
  readonly isValid: boolean;
  readonly errors: readonly string[];
};

export const validateOwnersYaml = async (
  req: IValidateOwnersYamlRequest
): Promise<IValidateOwnersYamlResponse> => {
  const nonNamespacedTeamNames = req.repositoryOwners.teams.filter(
    (it) => !it.name.startsWith(req.repositoryName)
  );
  if (nonNamespacedTeamNames.length > 0) {
    return {
      isValid: false,
      errors: nonNamespacedTeamNames.map(
        (it) =>
          `Invalid team name ("${it.name}"). Missing repo name ("${req.repositoryName}") prefix.`
      ),
    };
  }
  return {
    isValid: true,
    errors: [],
  };
};
