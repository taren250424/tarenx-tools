/**
 * Joins each category's code points with their Unicode names and search
 * keywords, then writes generated-data.json.
 *
 * Names come from the vendored UnicodeData.txt, the same snapshot
 * verify-blocks.ts checks against. Keywords come from two places: CLDR
 * annotations for emoji, which carry English and Korean terms the formal names
 * miss, and the hand-kept aliases.ts for everything else.
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

/** Locales whose CLDR annotations are vendored beside this script. */
const CLDR_LOCALES = ["en", "ko"];

/**
 * Categories CLDR annotations are applied to. CLDR only annotates emoji, so
 * running it over every category would do nothing for most of them; it does
 * cover some non-emoji symbols, which stay on aliases.ts for now.
 */
const EMOJI_CATEGORIES = new Set([
  "emoticons",
  "miscellaneous_symbols_and_pictographs",
  "transport_and_map_symbols",
  "supplemental_symbols_and_pictographs",
  "symbols_and_pictographs_extended_a",
]);

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

const decodeXml = (value: string) =>
  value
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(Number(dec)))
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&");

/**
 * CLDR keywords per character, both locales merged.
 *
 * Each character gets a pipe-separated keyword list plus a `type="tts"` short
 * name — "grinning face" / "활짝 웃는 얼굴" — which is worth keeping because it
 * reads far better than the formal name and is the only entry for characters
 * whose keyword list a locale has not filled in.
 */
function readCldrKeywords(): Map<string, string[]> {
  const keywords = new Map<string, string[]>();

  for (const locale of CLDR_LOCALES) {
    const file = path.resolve(__dirname, `cldr-annotations-${locale}.xml`);
    const xml = fs.readFileSync(file, "utf-8");
    for (const match of xml.matchAll(/<annotation cp="([^"]+)"([^>]*)>([^<]*)<\/annotation>/g)) {
      const char = decodeXml(match[1]);
      const body = decodeXml(match[3]);
      const words = /type="tts"/.test(match[2]) ? [body] : body.split("|");

      const existing = keywords.get(char) ?? [];
      for (const word of words) {
        const trimmed = word.trim().toLowerCase();
        if (trimmed && !existing.includes(trimmed)) existing.push(trimmed);
      }
      keywords.set(char, existing);
    }
  }

  return keywords;
}

/**
 * Drops keywords the search would already match through something else.
 *
 * Matching is substring-based, so "grin" is dead weight next to "grinning",
 * and "grinning face" is dead weight next to the name GRINNING FACE. CLDR
 * ships many such near-duplicates; removing them costs no recall and roughly
 * halves the payload. Longest first, so the survivor is the one that covers
 * the most queries.
 */
function prune(keywords: string[], name: string): string[] {
  const haystack = name.toLowerCase();
  const kept: string[] = [];
  for (const word of [...keywords].sort((a, b) => b.length - a.length)) {
    if (haystack.includes(word)) continue;
    if (kept.some((other) => other.includes(word))) continue;
    kept.push(word);
  }
  return kept;
}

const unknownCategories = [...EMOJI_CATEGORIES].filter((key) => !(key in unicodeRanges));
if (unknownCategories.length > 0) {
  console.error(`EMOJI_CATEGORIES names no category defines: ${unknownCategories.join(" ")}`);
  process.exit(1);
}

const names = readNames();
const cldr = readCldrKeywords();
const data: UnicodeData = {};
const unnamed: string[] = [];
const usedAliases = new Set<string>();
let annotated = 0;
let emojiTotal = 0;

for (const [key, value] of Object.entries(unicodeRanges)) {
  const isEmoji = EMOJI_CATEGORIES.has(key);
  const entries: UnicodeEntry[] = [];

  for (const [start, end] of value.range) {
    for (const codePoint of getUnicodes(start, end)) {
      const name = names.get(codePoint);
      if (name === undefined) {
        unnamed.push(`${key} U+${codePoint.toString(16).toUpperCase()}`);
        continue;
      }

      const char = String.fromCodePoint(codePoint);
      const keywords: string[] = [];

      if (isEmoji) {
        emojiTotal++;
        const annotations = cldr.get(char);
        if (annotations) {
          keywords.push(...annotations);
          annotated++;
        }
      }

      // Hand-written aliases win ties and extend whatever CLDR provided.
      const manual = aliases[char];
      if (manual) {
        usedAliases.add(char);
        for (const word of manual) {
          const lower = word.toLowerCase();
          if (!keywords.includes(lower)) keywords.push(lower);
        }
      }

      const kept = prune(keywords, name);
      entries.push(kept.length > 0 ? [char, name, kept] : [char, name]);
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

const all = Object.values(data).flat();
const sizeKb = (fs.statSync(OUTPUT_PATH).size / 1024).toFixed(1);
console.log(`Pre-built unicode data generated at ${OUTPUT_PATH}`);
console.log(`${Object.keys(data).length} categories | ${all.length} characters | ${sizeKb} KB`);
console.log(
  `keywords: ${all.filter((entry) => entry.length === 3).length} characters ` +
    `(CLDR ${annotated}/${emojiTotal} emoji, aliases.ts ${usedAliases.size})`
);
