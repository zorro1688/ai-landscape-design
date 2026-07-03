import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const roots = ["app", "components", "config", "lib"];
const extensions = new Set([".ts", ".tsx"]);
const mojibakePattern = /馃|鈫|鈥|鏃|娴|涓|绛|�/;
const matches = [];

function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      walk(fullPath);
      continue;
    }

    if (![...extensions].some((ext) => fullPath.endsWith(ext))) continue;

    const source = readFileSync(fullPath, "utf8");
    const lines = source.split(/\r?\n/);
    lines.forEach((line, index) => {
      if (mojibakePattern.test(line)) {
        matches.push(`${relative(process.cwd(), fullPath)}:${index + 1}: ${line.trim()}`);
      }
    });
  }
}

for (const root of roots) walk(root);

assert.deepEqual(matches, [], `Mojibake text found:\n${matches.join("\n")}`);
console.log("no mojibake text passed");
