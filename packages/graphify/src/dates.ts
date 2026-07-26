// Date-format detection and parsing for messy statistical-CSV time labels
// (e.g. "2011.01 월", "2011.1/4", "2024 년", "2023-01-01").

export interface DateFormat {
  id: string;
  label: string;
  parse(raw: string): Date | null;
}

const YEAR_MIN = 1500;
const YEAR_MAX = 2500;
const yearOk = (y: number) => y >= YEAR_MIN && y <= YEAR_MAX;
// Month is 1-based here; day 0 of the next month = last day of `m`.
const endOfMonth = (y: number, m: number) => new Date(y, m, 0);

// Order matters: more specific formats first, so ties in detection
// (e.g. "2011.1/4" matches both quarter and YYYY-MM) resolve to the
// more specific interpretation.
export const FORMATS: DateFormat[] = [
  {
    id: "quarter",
    label: "YYYY-Q (quarterly)",
    parse(raw) {
      const m = raw.match(
        /(\d{4})\s*[.\-/년]?\s*(?:Q\s*([1-4])|([1-4])\s*\/\s*4(?!\d)|([1-4])\s*분기)/i
      );
      if (!m) return null;
      const y = Number(m[1]);
      const q = Number(m[2] ?? m[3] ?? m[4]);
      return yearOk(y) ? endOfMonth(y, q * 3) : null;
    },
  },
  {
    id: "ymd",
    label: "YYYY-MM-DD",
    parse(raw) {
      const m = raw.match(
        /(\d{4})\s*[.\-/년]\s*(\d{1,2})\s*[.\-/월]\s*(\d{1,2})(?!\d)/
      );
      if (!m) return null;
      const y = Number(m[1]);
      const mo = Number(m[2]);
      const d = Number(m[3]);
      if (!yearOk(y) || mo < 1 || mo > 12 || d < 1 || d > 31) return null;
      return new Date(y, mo - 1, d);
    },
  },
  {
    id: "ym",
    label: "YYYY-MM (monthly)",
    parse(raw) {
      const m = raw.match(/(\d{4})\s*[.\-/년]\s*(\d{1,2})(?!\d)/);
      if (!m) return null;
      const y = Number(m[1]);
      const mo = Number(m[2]);
      if (!yearOk(y) || mo < 1 || mo > 12) return null;
      return endOfMonth(y, mo);
    },
  },
  {
    id: "year",
    label: "YYYY (yearly)",
    parse(raw) {
      const m = raw.match(/(?:^|\D)(\d{4})(?!\d)/);
      if (!m) return null;
      const y = Number(m[1]);
      return yearOk(y) ? new Date(y, 11, 31) : null;
    },
  },
];

// User-supplied format string made of YYYY / MM / DD / Q tokens.
// Numbers are extracted from the label in order and assigned to tokens,
// so separators in the format string are decorative ("YYYY.MM 월" works).
export function makeTokenFormat(fmt: string): DateFormat {
  return {
    id: "custom",
    label: `${fmt} (custom)`,
    parse(raw) {
      const nums = raw.match(/\d+/g)?.map(Number) ?? [];
      const tokens = fmt.match(/YYYY|MM|DD|Q/g) ?? [];
      if (tokens.length === 0 || nums.length < tokens.length) return null;
      const v: Partial<Record<string, number>> = {};
      tokens.forEach((t, i) => {
        v[t] = nums[i];
      });
      let year = v["YYYY"];
      if (year !== undefined && year < 100) year += 2000;
      const q = v["Q"];
      const mo = v["MM"];
      const d = v["DD"];
      if (q !== undefined) {
        if (year === undefined || q < 1 || q > 4) return null;
        return endOfMonth(year, q * 3);
      }
      if (mo !== undefined && (mo < 1 || mo > 12)) return null;
      if (year === undefined) return null;
      if (mo !== undefined && d !== undefined) {
        if (d < 1 || d > 31) return null;
        return new Date(year, mo - 1, d);
      }
      if (mo !== undefined) return endOfMonth(year, mo);
      return new Date(year, 11, 31);
    },
  };
}

export interface AxisParse {
  format: DateFormat;
  dates: (Date | null)[];
  hits: number;
  score: number;
}

// Parse every axis cell with one format. The score rewards monotonically
// non-decreasing sequences (a header of dates beats a data line whose values
// merely look like years) and coverage (a real time axis is *mostly* dates,
// while a data line with a few year-like values among thousands is not).
export function parseAxisWith(cells: string[], format: DateFormat): AxisParse {
  const dates = cells.map((c) => (c && c.trim() ? format.parse(c) : null));
  const nonEmpty = cells.filter((c) => c && c.trim()).length;
  const seq = dates.filter((d): d is Date => d !== null);
  let mono = 0;
  for (let i = 1; i < seq.length; i++) {
    if (+seq[i] >= +seq[i - 1]) mono++;
  }
  const monoRatio = seq.length > 1 ? mono / (seq.length - 1) : 1;
  const coverage = nonEmpty > 0 ? seq.length / nonEmpty : 0;
  return {
    format,
    dates,
    hits: seq.length,
    score: seq.length * (0.5 + 0.5 * monoRatio) * coverage,
  };
}

const MIN_HITS = 3;

export function detectAxisFormat(cells: string[]): AxisParse | null {
  let best: AxisParse | null = null;
  for (const format of FORMATS) {
    const p = parseAxisWith(cells, format);
    if (p.hits >= MIN_HITS && (!best || p.score > best.score)) best = p;
  }
  return best;
}
