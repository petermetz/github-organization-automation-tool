import "array.prototype.flat";

export * from "./lib/async";
export * from "./lib/number";

import { main } from "./lib/main";
export { main } from "./lib/main";

if (require && require.main === module) {
  main(process.argv, process.env);
}
