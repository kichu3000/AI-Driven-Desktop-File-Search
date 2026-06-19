import { getSearchRoots } from "./searchEngine.js"


console.log(getSearchRoot({ drive: "E:", folder: "Downloads" }));
console.log(getSearchRoot({ folder: "Documents" }));
console.log(getSearchRoot({}));