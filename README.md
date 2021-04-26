# github-organization-automation-tool

GOAT is a tool to automate tedious manual tasks related to organization management through the GitHub API.

## Usage

  ```sh
  npm i -g github-organization-automation-tool
  ```

### Sync Group Memberships from OWNERS.yaml to GitHub Organization 

This example syncs the `OWNERS.yaml` file's contents in the GitHub org and the
repository.
The `OWNERS.yaml` file will be located on the branch `main`.
If you omit the last two arguments these will be the defaulted values as well.
  ```sh
  GITHUB_TOKEN=$YOUR_TOKEN npx github-organization-automation-tool sync-owners your-organization-name your-repository-name main OWNERS.yaml
  ```