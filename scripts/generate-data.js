const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const inputPath = path.join(root, "unc_fall_2025_deans_list.csv");
const outputPath = path.join(root, "src", "deans-list-data.js");
const expectedHeader = ["name", "proj_level", "city", "state"];

function parseCsv(text) {
  const rows = [];
  let row = [];
  let value = "";
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (quoted) {
      if (char === '"' && next === '"') {
        value += '"';
        index += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        value += char;
      }
      continue;
    }

    if (char === '"') {
      quoted = true;
    } else if (char === ",") {
      row.push(value);
      value = "";
    } else if (char === "\n") {
      row.push(value);
      rows.push(row);
      row = [];
      value = "";
    } else if (char !== "\r") {
      value += char;
    }
  }

  if (value || row.length) {
    row.push(value);
    rows.push(row);
  }

  return rows;
}

function readRows() {
  const csv = fs.readFileSync(inputPath, "utf8").replace(/^\ufeff/, "");
  const rows = parseCsv(csv);
  const header = rows.shift();

  if (JSON.stringify(header) !== JSON.stringify(expectedHeader)) {
    throw new Error(`unexpected csv header: ${header.join(",")}`);
  }

  const records = rows
    .filter((row) => row.some((value) => value.trim()))
    .map((row) =>
      Object.fromEntries(
        expectedHeader.map((key, index) => [key, (row[index] || "").trim()])
      )
    );

  if (!records.length) {
    throw new Error("no dean's list records found");
  }

  return records;
}

function render(records) {
  return `(function () {
  globalThis.UNC_DEANS_LIST_RADAR_DATA = ${JSON.stringify(records)};
})();
`;
}

function main() {
  const records = readRows();
  const output = render(records);

  if (process.argv.includes("--check")) {
    const current = fs.existsSync(outputPath)
      ? fs.readFileSync(outputPath, "utf8")
      : "";
    if (current !== output) {
      throw new Error("generated data is out of date");
    }
    return;
  }

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, output);
}

main();
