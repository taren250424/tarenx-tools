import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { unicodeRanges } from "../src/unicode/constants.js";
import { getUnicodes } from "../src/unicode/utils.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const data: Record<string, string> = {};

for (const [key, value] of Object.entries(unicodeRanges)) {
  const unicodes = value.range.flatMap(([start, end]) => getUnicodes(start, end));
  const html = unicodes
    .map(
      (item) =>
        `<button class="unicode-item" title="${item.code}" data-char="${item.char}">${item.char}</button>`
    )
    .join("");
  data[key] = html;
}

const outputPath = path.resolve(__dirname, "../src/unicode/generated-data.json");
fs.writeFileSync(outputPath, JSON.stringify(data), "utf-8");
console.log(`Pre-built unicode data generated at ${outputPath}`);
