# github-organization-automation-tool

GOAT is a tool to automate tedious manual tasks related to organization management through the GitHub API.

## Usage


### npm

  ```sh
  npm i -g github-organization-automation-tool
  ```

### Docker

  ```sh
  docker run \
    --rm \
    --env GITHUB_TOKEN=$YOUR_TOKEN \
    petermetz/github-organization-automation-tool:main \
    sync-owners \
    hyperledger-cicd \
    besu \
    main \
    OWNERS.yaml
  ```

### Sync Group Memberships from OWNERS.yaml to GitHub Organization 

This example syncs the `OWNERS.yaml` file's contents in the GitHub org and the
repository.
The `OWNERS.yaml` file will be located on the branch `main`.
If you omit the last two arguments these will be the defaulted values as well.
  ```sh
  GITHUB_TOKEN=$YOUR_TOKEN npx github-organization-automation-tool sync-owners your-organization-name your-repository-name main OWNERS.yaml
  ```

### Building Container Image Locally

  ```sh
  DOCKER_BUILDKIT=1 docker build -f ./Dockerfile . -t goat
  ```

### Testing the CLI Locally

Terminal #1

```sh
npm run watch:build
```

Terminal #2
```sh
GITHUB_TOKEN=$YOUR_TOKEN \
./bin/github-organization-automation-tool \
   sync-owners \
   hyperledger-cicd \
   besu \
   main \
   OWNERS.yaml
```