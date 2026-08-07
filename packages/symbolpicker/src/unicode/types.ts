export type Unicode = {
  label: string;
  range: [number, number][];
};

/**
 * A character, its Unicode name, and any extra search keywords:
 * ["∠", "ANGLE"] or ["°", "DEGREE SIGN", ["각도", "도", "온도", "섭씨"]].
 * The third slot is omitted for characters without aliases.
 */
export type UnicodeEntry = [char: string, name: string, aliases?: string[]];

/** Shape of generated-data.json: category key -> entries, in code point order. */
export type UnicodeData = Record<string, UnicodeEntry[]>;
