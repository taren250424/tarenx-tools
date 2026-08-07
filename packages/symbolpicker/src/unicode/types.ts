export type Unicode = {
  label: string;
  range: [number, number][];
};

/** A character and its Unicode name, e.g. ["∠", "ANGLE"]. */
export type UnicodeEntry = [char: string, name: string];

/** Shape of generated-data.json: category key -> entries, in code point order. */
export type UnicodeData = Record<string, UnicodeEntry[]>;
