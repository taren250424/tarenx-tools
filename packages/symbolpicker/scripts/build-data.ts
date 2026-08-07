/**
 * Joins each category's code points with their Unicode names and writes
 * generated-data.json. Names come from the vendored UnicodeData.txt, the same
 * snapshot verify-blocks.ts checks against, and drive the search index at
 * runtime.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { unicodeRanges } from "../src/unicode/constants.js";
import { aliases } from "../src/unicode/aliases.js";
import { getUnicodes } from "../src/unicode/utils.js";
import type { UnicodeData, UnicodeEntry } from "../src/unicode/types.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UNICODE_DATA_PATH = path.resolve(__dirname, "UnicodeData.txt");
const OUTPUT_PATH = path.resolve(__dirname, "../src/unicode/generated-data.json");

function readNames(): Map<number, string> {
  const names = new Map<number, string>();
  for (const line of fs.readFileSync(UNICODE_DATA_PATH, "utf-8").split(/\r?\n/)) {
    const fields = line.split(";");
    if (fields.length < 2) continue;
    const name = fields[1];
    // Skip <control>, <..., First> and friends: placeholders, not real names.
    if (name.startsWith("<")) continue;
    names.set(parseInt(fields[0], 16), name);
  }
  return names;
}

const names = readNames();
const data: UnicodeData = {};
const unnamed: string[] = [];
const usedAliases = new Set<string>();

for (const [key, value] of Object.entries(unicodeRanges)) {
  const entries: UnicodeEntry[] = [];
  for (const [start, end] of value.range) {
    for (const codePoint of getUnicodes(start, end)) {
      const name = names.get(codePoint);
      if (name === undefined) {
        unnamed.push(`${key} U+${codePoint.toString(16).toUpperCase()}`);
        continue;
      }
      const char = String.fromCodePoint(codePoint);
      const keywords = aliases[char];
      if (keywords === undefined) entries.push([char, name]);
      else {
        usedAliases.add(char);
        entries.push([char, name, keywords.map((word) => word.toLowerCase())]);
      }
    }
  }
  data[key] = entries;
}

if (unnamed.length > 0) {
  console.error(`No Unicode name for ${unnamed.length} code point(s):`);
  for (const item of unnamed.slice(0, 20)) console.error(`  ${item}`);
  process.exit(1);
}

// An alias for a character no category contains would never be searchable.
const orphaned = Object.keys(aliases).filter((char) => !usedAliases.has(char));
if (orphaned.length > 0) {
  console.error(`aliases.ts keys not present in any category: ${orphaned.join(" ")}`);
  process.exit(1);
}

fs.writeFileSync(OUTPUT_PATH, JSON.stringify(data), "utf-8");

const total = Object.values(data).reduce((sum, entries) => sum + entries.length, 0);
const sizeKb = (fs.statSync(OUTPUT_PATH).size / 1024).toFixed(1);
console.log(`Pre-built unicode data generated at ${OUTPUT_PATH}`);
console.log(`${Object.keys(data).length} categories | ${total} characters | ${sizeKb} KB`);
