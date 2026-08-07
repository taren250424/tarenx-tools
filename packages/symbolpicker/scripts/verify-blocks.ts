/**
 * Checks constants.ts against the Unicode Character Database:
 *
 *   - every `// Unicode block name: ...` comment cites a real block
 *   - the range an inline comment annotates stays inside that block
 *   - cited blocks and the blocks the ranges touch are the same set
 *   - no range covers an unassigned code point (those render as tofu)
 *
 * Blocks.txt and UnicodeData.txt are vendored next to this script so the check
 * is deterministic and offline. Refresh both from
 * https://www.unicode.org/Public/UCD/latest/ucd/ when adopting a newer Unicode
 * version.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BLOCKS_PATH = path.resolve(__dirname, "Blocks.txt");
const UNICODE_DATA_PATH = path.resolve(__dirname, "UnicodeData.txt");
const CONSTANTS_PATH = path.resolve(__dirname, "../src/unicode/constants.ts");

const hex = (n: number) => n.toString(16).toUpperCase().padStart(4, "0");

/** Collapses a sorted code point list into `U+0378-0379, U+0380` style runs. */
function formatRuns(codePoints: number[]): string {
  const runs: string[] = [];
  for (let i = 0; i < codePoints.length; ) {
    let j = i;
    while (j + 1 < codePoints.length && codePoints[j + 1] === codePoints[j] + 1) j++;
    runs.push(
      i === j ? `U+${hex(codePoints[i])}` : `U+${hex(codePoints[i])}-${hex(codePoints[j])}`
    );
    i = j + 1;
  }
  return runs.join(", ");
}

type Block = { start: number; end: number; name: string };

function readBlocks(): { blocks: Block[]; version: string } {
  const text = fs.readFileSync(BLOCKS_PATH, "utf-8");
  const version = text.match(/^# Blocks-(\S+)\.txt/)?.[1] ?? "unknown";
  const blocks: Block[] = [];
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^([0-9A-F]+)\.\.([0-9A-F]+); (.+)$/);
    if (m) blocks.push({ start: parseInt(m[1], 16), end: parseInt(m[2], 16), name: m[3] });
  }
  return { blocks, version };
}

/**
 * Assigned code points, as sorted [start, end] pairs. UnicodeData.txt lists one
 * code point per line except for large runs, which it compresses into a
 * `<..., First>` / `<..., Last>` pair.
 */
function readAssigned(): [number, number][] {
  const spans: [number, number][] = [];
  let rangeStart: number | null = null;

  for (const line of fs.readFileSync(UNICODE_DATA_PATH, "utf-8").split(/\r?\n/)) {
    const fields = line.split(";");
    if (fields.length < 2) continue;
    const cp = parseInt(fields[0], 16);
    const name = fields[1];

    if (name.endsWith(", First>")) rangeStart = cp;
    else if (name.endsWith(", Last>")) {
      spans.push([rangeStart ?? cp, cp]);
      rangeStart = null;
    } else spans.push([cp, cp]);
  }

  return spans;
}

function isAssignedLookup(spans: [number, number][]) {
  return (cp: number) => {
    let lo = 0;
    let hi = spans.length - 1;
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      if (cp < spans[mid][0]) hi = mid - 1;
      else if (cp > spans[mid][1]) lo = mid + 1;
      else return true;
    }
    return false;
  };
}

type Category = {
  key: string;
  line: number;
  ranges: [number, number][];
  names: string[];
  /** block-name comments that annotate a single range on the same line */
  inline: { line: number; range: [number, number]; name: string }[];
};

function readCategories(): Category[] {
  const lines = fs.readFileSync(CONSTANTS_PATH, "utf-8").split(/\r?\n/);
  const categories: Category[] = [];
  let current: Category | null = null;

  lines.forEach((line, i) => {
    const open = line.match(/^ {2}([a-z0-9_]+): \{/);
    if (open) {
      current = { key: open[1], line: i + 1, ranges: [], names: [], inline: [] };
      categories.push(current);
    }
    if (!current) return;

    const ranges = [...line.matchAll(/\[(0x[0-9a-f]+), *(0x[0-9a-f]+)\]/g)].map(
      (m) => [parseInt(m[1], 16), parseInt(m[2], 16)] as [number, number]
    );
    current.ranges.push(...ranges);

    const comment = line.match(/Unicode block names?: (.+?)\s*$/);
    if (comment) {
      const names = comment[1].split(/,\s*/).map((s) => s.trim());
      current.names.push(...names);
      if (ranges.length === 1 && names.length === 1)
        current.inline.push({ line: i + 1, range: ranges[0], name: names[0] });
    }

    if (/^ {2}\},/.test(line)) current = null;
  });

  return categories;
}

const { blocks, version } = readBlocks();
const byName = new Map(blocks.map((b) => [b.name, b]));
const isAssigned = isAssignedLookup(readAssigned());
const categories = readCategories();
const problems: string[] = [];
let codePointCount = 0;

for (const cat of categories) {
  if (cat.names.length === 0) {
    problems.push(`L${cat.line}  ${cat.key}: no Unicode block name comment`);
    continue;
  }

  // 1. every cited name must appear verbatim in Blocks.txt
  const cited: Block[] = [];
  for (const name of cat.names) {
    const block = byName.get(name);
    if (!block) problems.push(`L${cat.line}  ${cat.key}: not a Unicode block name -> "${name}"`);
    else cited.push(block);
  }

  // 2. an inline comment must annotate a range inside the block it names
  for (const { line, range, name } of cat.inline) {
    const block = byName.get(name);
    if (block && (range[0] < block.start || range[1] > block.end))
      problems.push(
        `L${line}  ${cat.key}: range [${hex(range[0])}..${hex(range[1])}] escapes ` +
          `${block.name} (${hex(block.start)}..${hex(block.end)})`
      );
  }

  // 3. cited names and touched blocks must be the same set
  if (cited.length > 0) {
    const citedNames = new Set(cited.map((b) => b.name));
    const touched = new Set<string>();
    for (const [start, end] of cat.ranges)
      for (const b of blocks) if (start <= b.end && end >= b.start) touched.add(b.name);

    for (const name of touched)
      if (!citedNames.has(name))
        problems.push(`L${cat.line}  ${cat.key}: range touches "${name}" but no comment cites it`);
    for (const name of citedNames)
      if (!touched.has(name))
        problems.push(`L${cat.line}  ${cat.key}: cites "${name}" but no range falls in it`);
  }

  // 4. no range may cover an unassigned code point
  const unassigned: number[] = [];
  for (const [start, end] of cat.ranges)
    for (let cp = start; cp <= end; cp++) {
      codePointCount++;
      if (!isAssigned(cp)) unassigned.push(cp);
    }
  if (unassigned.length > 0)
    problems.push(`L${cat.line}  ${cat.key}: unassigned -> ${formatRuns(unassigned)}`);
}

for (const problem of problems) console.error(problem);
console.log(
  `${problems.length ? "\n" : ""}Unicode ${version} | ${categories.length} categories | ` +
    `${codePointCount} code points | ${problems.length} problem(s)`
);
process.exit(problems.length ? 1 : 0);
