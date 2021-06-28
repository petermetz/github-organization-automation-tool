import "array.prototype.flat";

import { main } from "./lib/main";
export { main } from "./lib/main";
export { validateOwnersYaml } from "./lib/validate-owners-yaml";

if (require && require.main === module) {
  main(process.argv, process.env);
}
