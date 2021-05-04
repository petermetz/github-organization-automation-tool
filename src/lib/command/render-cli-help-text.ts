import { PROJECT_NAME_LONG } from "../constants";

export async function renderCliHelpText(): Promise<string> {
  const helpText =
    `${PROJECT_NAME_LONG}` +
    `\n` +
    `Usage: GITHUB_TOKEN=$YOUR_TOKEN goat commandName=[list]`;
  return helpText;
}
