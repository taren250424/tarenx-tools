/**
 * Verifies that every `// Unicode block name: ...` comment in constants.ts
 * cites a real Unicode block and that the range it annotates stays inside it.
 *
 * Blocks.txt is vendored next to this script so the check is deterministic and
 * offline. Refresh it from https://www.unicode.org/Public/UCD/latest/ucd/Blocks.txt
 * when adopting a newer Unicode version.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BLOCKS_PATH = path.resolve(__dirname, "Blocks.txt");
const CONSTANTS_PATH = path.resolve(__dirname, "../src/unicode/constants.ts");

const hex = (n: number) => n.toString(16).toUpperCase().padStart(4, "0");

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
const categories = readCategories();
const problems: string[] = [];

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
}

for (const problem of problems) console.error(problem);
console.log(
  `${problems.length ? "\n" : ""}Unicode ${version} | ${categories.length} categories | ` +
    `${problems.length} problem(s)`
);
process.exit(problems.length ? 1 : 0);
