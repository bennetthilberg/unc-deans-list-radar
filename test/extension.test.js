const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..");
const { normalizeName } = require(path.join(root, "src", "name-utils.js"));

const context = { globalThis: {} };
vm.createContext(context);
vm.runInContext(
  fs.readFileSync(path.join(root, "src", "deans-list-data.js"), "utf8"),
  context
);

const data = context.globalThis.UNC_DEANS_LIST_RADAR_DATA;
const lookup = new Map();

for (const row of data) {
  const key = normalizeName(row.name);
  if (!lookup.has(key)) {
    lookup.set(key, []);
  }
  lookup.get(key).push(row);
}

function listed(name) {
  return lookup.has(normalizeName(name));
}

assert(Array.isArray(data));
assert(data.length > 0);
assert.strictEqual(normalizeName(" José  O\u2019Neil "), "jose o'neil");
assert.strictEqual(normalizeName("Ava\u2013Marie"), "ava-marie");
assert.strictEqual(lookup.get(normalizeName("Aadi Patel")).length, 2);
assert.strictEqual(listed("Lila Anafi"), true);
assert.strictEqual(listed("Bennett Hilberg"), true);
assert.strictEqual(listed("William Layton"), true);
assert.strictEqual(listed("Ethan Duarte-Nirenberg"), false);
assert.strictEqual(listed("Alexander Fried"), false);

console.log("tests passed");
