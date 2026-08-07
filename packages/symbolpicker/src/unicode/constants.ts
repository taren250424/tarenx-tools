import type { Unicode } from "./types";

export const unicodeRanges: Record<string, Unicode> = {
  // ── Latin & Greek ──────────────────────────────────────────────
  latin: {
    label: "Latin",
    // U+0080–009F: C1 control characters (invisible)
    // U+00A0: no-break space (invisible)
    // U+00AD: soft hyphen (invisible)
    range: [
      [0x00a1, 0x00ac], // Unicode block name: Latin-1 Supplement
      [0x00ae, 0x00ff], // Unicode block name: Latin-1 Supplement
      [0x0100, 0x017f], // Unicode block name: Latin Extended-A
      [0x0180, 0x024f], // Unicode block name: Latin Extended-B
    ],
  },
  greek_and_coptic: {
    label: "Greek & Coptic",
    range: [[0x0370, 0x03ff]], // Unicode block name: Greek and Coptic
  },

  // ── Punctuation ────────────────────────────────────────────────
  general_punctuation: {
    label: "Punctuation",
    // Unicode block name: General Punctuation
    // U+2028–202F: allocated but unassigned
    range: [
      [0x2010, 0x2027],
      [0x2030, 0x205e],
    ],
  },
  supplemental_punctuation: {
    label: "Supplemental Punctuation",
    // Unicode block name: Supplemental Punctuation
    // U+2E5E–2E7F: allocated but unassigned
    range: [[0x2e00, 0x2e5d]],
  },

  // ── Numbers & Scripts ──────────────────────────────────────────
  superscripts_and_subscripts: {
    label: "Super/Subscripts",
    // Unicode block name: Superscripts and Subscripts
    // U+2072–2073, U+208F: unassigned
    range: [
      [0x2070, 0x2071],
      [0x2074, 0x208e],
      [0x2090, 0x209c],
    ],
  },
  number_forms: {
    label: "Number Forms",
    // Unicode block name: Number Forms
    // U+218C–218F: allocated but unassigned
    range: [[0x2150, 0x218b]],
  },
  currency_symbols: {
    label: "Currency",
    // Unicode block name: Currency Symbols
    // U+20C2–20CF: allocated but unassigned
    range: [[0x20a0, 0x20c1]],
  },

  // ── Letterlike & Enclosed ──────────────────────────────────────
  letterlike_symbols: {
    label: "Letterlike Symbols",
    // Unicode block name: Letterlike Symbols
    range: [[0x2100, 0x214f]],
  },
  enclosed_alphanumerics: {
    label: "Enclosed Alphanumerics",
    // Unicode block name: Enclosed Alphanumerics
    range: [[0x2460, 0x24ff]],
  },

  // ── Arrows ─────────────────────────────────────────────────────
  arrows: {
    label: "Arrows",
    range: [
      [0x2190, 0x21ff], // Unicode block name: Arrows
      [0x27f0, 0x27ff], // Unicode block name: Supplemental Arrows-A
      [0x2900, 0x297f], // Unicode block name: Supplemental Arrows-B
      [0x2b00, 0x2bff], // Unicode block name: Miscellaneous Symbols and Arrows
    ],
  },

  // ── Math ───────────────────────────────────────────────────────
  math: {
    label: "Math",
    // U+2AFE–2AFF: White Vertical Bar, N-Ary White Vertical Bar (limited font support)
    range: [
      [0x2200, 0x22ff], // Unicode block name: Mathematical Operators
      [0x27c0, 0x27ef], // Unicode block name: Miscellaneous Mathematical Symbols-A
      [0x2980, 0x29ff], // Unicode block name: Miscellaneous Mathematical Symbols-B
      [0x2a00, 0x2afd], // Unicode block name: Supplemental Mathematical Operators
    ],
  },

  // ── Technical & Control ────────────────────────────────────────
  miscellaneous_technical: {
    label: "Misc Technical",
    // Unicode block name: Miscellaneous Technical
    range: [[0x2300, 0x23ff]],
  },
  control_pictures: {
    label: "Control Pictures",
    // Unicode block name: Control Pictures
    // U+2427–243F: allocated but unassigned
    range: [[0x2400, 0x2426]],
  },
  optical_character_recognition: {
    label: "OCR Symbols",
    // Unicode block name: Optical Character Recognition
    // U+244B–245F: allocated but unassigned
    range: [[0x2440, 0x244a]],
  },

  // ── Drawing & Shapes ───────────────────────────────────────────
  box_drawing: {
    label: "Box Drawing",
    // Unicode block name: Box Drawing
    range: [[0x2500, 0x257f]],
  },
  block_elements: {
    label: "Block Elements",
    // Unicode block name: Block Elements
    range: [[0x2580, 0x259f]],
  },
  geometric_shapes: {
    label: "Geometric Shapes",
    // Unicode block name: Geometric Shapes
    range: [[0x25a0, 0x25ff]],
  },

  // ── Symbols ────────────────────────────────────────────────────
  miscellaneous_symbols: {
    label: "Misc Symbols",
    // Unicode block name: Miscellaneous Symbols
    range: [[0x2600, 0x26ff]],
  },
  dingbats: {
    label: "Dingbats",
    // Unicode block name: Dingbats
    range: [[0x2700, 0x27bf]],
  },
  braille_patterns: {
    label: "Braille Patterns",
    // Unicode block name: Braille Patterns
    range: [[0x2800, 0x28ff]],
  },

  // ── CJK & Japanese ────────────────────────────────────────────
  cjk_symbols_and_punctuation: {
    label: "CJK Symbols",
    // Unicode block name: CJK Symbols and Punctuation
    range: [[0x3000, 0x303f]],
  },
  hiragana: {
    label: "Hiragana",
    // Unicode block name: Hiragana
    // U+3040 is unassigned
    range: [[0x3041, 0x309f]],
  },
  katakana: {
    // Unicode block name: Katakana
    label: "Katakana",
    range: [[0x30a0, 0x30ff]],
  },

  // ── Game Tiles ─────────────────────────────────────────────────
  mahjong_tiles: {
    label: "Mahjong Tiles",
    // Unicode block name: Mahjong Tiles
    // U+1F02C–1F02F: allocated but unassigned
    range: [[0x1f000, 0x1f02b]],
  },
  domino_tiles: {
    label: "Domino Tiles",
    // Unicode block name: Domino Tiles
    // U+1F094–1F09F: allocated but unassigned
    range: [[0x1f030, 0x1f093]],
  },
  playing_cards: {
    label: "Playing Cards",
    // Unicode block name: Playing Cards
    // Excludes unassigned suit boundaries and U+1F0F6–1F0FF
    range: [
      [0x1f0a0, 0x1f0ae],
      [0x1f0b1, 0x1f0bf],
      [0x1f0c1, 0x1f0cf],
      [0x1f0d1, 0x1f0f5],
    ],
  },

  // ── Emoji ──────────────────────────────────────────────────────
  miscellaneous_symbols_and_pictographs: {
    label: "Pictographs",
    // Unicode block name: Miscellaneous Symbols and Pictographs
    range: [[0x1f300, 0x1f5ff]],
  },
  emoticons: {
    label: "Emoticons",
    // Unicode block name: Emoticons
    range: [[0x1f600, 0x1f64f]],
  },
  transport_and_map_symbols: {
    label: "Transport & Map",
    // Unicode block name: Transport and Map Symbols
    // U+1F6C6–1F6CA, U+1F6D3–1F6D4, U+1F6D8–1F6DB, U+1F6E6–1F6E8, U+1F6EA, U+1F6ED–1F6EF, U+1F6F1–1F6F2: unassigned
    range: [
      [0x1f680, 0x1f6c5],
      [0x1f6cb, 0x1f6d2],
      [0x1f6d5, 0x1f6d7],
      [0x1f6dc, 0x1f6e5],
      [0x1f6e9, 0x1f6e9],
      [0x1f6eb, 0x1f6ec],
      [0x1f6f0, 0x1f6f0],
      [0x1f6f3, 0x1f6fc],
    ],
  },
  supplemental_symbols_and_pictographs: {
    label: "Emoji (2016–18)",
    // Unicode block name: Supplemental Symbols and Pictographs
    // U+1F900–1F90B: Typikon symbols (limited font support)
    // U+1F946: Rifle (platform-dependent rendering)
    range: [
      [0x1f90c, 0x1f945],
      [0x1f947, 0x1f9ff],
    ],
  },
  symbols_and_pictographs_extended_a: {
    label: "Emoji (2019–)",
    // Unicode block name: Symbols and Pictographs Extended-A
    // U+1FA7D–1FA7F, U+1FA8A–1FA8E: limited font support (Unicode 15.0–16.0)
    // U+1FAC7–1FACD, U+1FADD–1FADE, U+1FAEA–1FAEE, U+1FAF9–1FAFF: unassigned
    range: [
      [0x1fa70, 0x1fa7c],
      [0x1fa80, 0x1fa89],
      [0x1fa8f, 0x1fac6],
      [0x1face, 0x1fadc],
      [0x1fadf, 0x1fae9],
      [0x1faf0, 0x1faf8],
    ],
  },
};
