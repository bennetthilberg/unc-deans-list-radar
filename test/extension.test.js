const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..");
const { normalizeName, shouldShowBadgeForRole } = require(
  path.join(root, "src", "name-utils.js")
);

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
assert.strictEqual(data.length, 11020);
assert.strictEqual(normalizeName(" José  O\u2019Neil "), "jose o'neil");
assert.strictEqual(normalizeName("Ava\u2013Marie"), "ava-marie");
assert.strictEqual(shouldShowBadgeForRole("Teacher"), false);
assert.strictEqual(shouldShowBadgeForRole(" teacher "), false);
assert.strictEqual(shouldShowBadgeForRole("Student"), true);
assert.strictEqual(shouldShowBadgeForRole("TA"), true);
assert.strictEqual(lookup.get(normalizeName("Abigail Wilson")).length, 2);
assert.strictEqual(lookup.get(normalizeName("Emma Mitchell")).length, 3);
assert.strictEqual(listed("A Hyun Kim"), true);
assert.strictEqual(listed("Lila Anafi"), true);
assert.strictEqual(listed("Bennett Hilberg"), true);
assert.strictEqual(listed("William Layton"), true);
assert.strictEqual(listed("Ethan Duarte-Nirenberg"), false);
assert.strictEqual(listed("Alexander Fried"), false);

console.log("tests passed");
