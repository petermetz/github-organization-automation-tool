import test from "ava";
import type { ExecutionContext } from "ava";

import { validateOwnersYaml } from "./validate-owners-yaml";

test("validateOwnersYaml - no prefix", async (t: ExecutionContext) => {
  const response = await validateOwnersYaml({
    repositoryName: "some-repository",
    repositoryOwners: {
      description: "",
      merge: [],
      name: "A free-form name for the repository",
      teams: [
        {
          "github-role": "x",
          description: "x",
          members: ["a"],
          name: "a",
        },
      ],
    },
  });
  t.false(response.isValid, "response.isValid === false OK");
  t.deepEqual(
    response.errors,
    [`Invalid team name ("a"). Missing repo name ("some-repository") prefix.`],
    "response.errors contains legible error message OK"
  );
});

test("validateOwnersYaml - has correct prefix", async (t: ExecutionContext) => {
  const response = await validateOwnersYaml({
    repositoryName: "some-repository",
    repositoryOwners: {
      description: "",
      merge: [],
      name: "A free-form name for the repository",
      teams: [
        {
          "github-role": "x",
          description: "x",
          members: ["a"],
          name: "some-repository_a",
        },
      ],
    },
  });
  t.true(response.isValid, "response.isValid === true OK");
  t.deepEqual(response.errors, [], "response.errors is empty array OK");
});
