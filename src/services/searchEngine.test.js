import assert from "node:assert"
import { searchFiles } from "./searchEngine.js"

const result = await searchFiles({
    limit : 10
})

assert.strictEqual(result.limit,"10")
console.log(result);
