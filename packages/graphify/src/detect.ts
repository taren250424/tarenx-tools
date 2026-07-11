import type { AxisParse, DateFormat } from './dates.ts';
import { detectAxisFormat, makeTokenFormat, parseAxisWith } from './dates.ts';

// 'horizontal' = X-axis labels run along a row (series are rows);
// 'vertical'   = X-axis labels run along a column (series are columns).
export type Orientation = 'horizontal' | 'vertical';
export type ChartMode = 'time' | 'category';

export interface Mapping {
	orientation: Orientation;
	axisIndex: number; // grid row holding the X-axis labels
	selected: Set<number>; // grid rows plotted as series
	colors: Map<number, string>; // per-grid-row color overrides
	formatOverride: string | null;
}

export function transpose(rows: string[][]): string[][] {
	const width = rows.reduce((w, r) => Math.max(w, r.length), 0);
	const out: string[][] = [];
	for (let c = 0; c < width; c++) out.push(rows.map((r) => r[c] ?? ''));
	return out;
}

// The "grid" is the oriented view: series are always grid rows and the
// axis is always a grid row, regardless of how the sheet is laid out.
export function gridFor(rows: string[][], orientation: Orientation): string[][] {
	return orientation === 'vertical' ? transpose(rows) : rows;
}

export function toNumber(raw: string | undefined): number | null {
	if (raw === undefined) return null;
	const s = raw.replace(/[,\s]/g, '');
	if (!s || !/^[-+]?(\d+\.?\d*|\.\d+)([eE][-+]?\d+)?$/.test(s)) return null;
	const n = Number(s);
	return Number.isFinite(n) ? n : null;
}

const SCAN_LIMIT = 40;

export interface TimeAxisHit {
	orientation: Orientation;
	axisIndex: number;
	parse: AxisParse;
}

// Scan the leading grid rows of one orientation for the row that parses
// best as a sequence of dates.
export function detectTimeAxisFor(rows: string[][], orientation: Orientation): TimeAxisHit | null {
	const grid = gridFor(rows, orientation);
	const limit = Math.min(grid.length, SCAN_LIMIT);
	let best: TimeAxisHit | null = null;
	for (let i = 0; i < limit; i++) {
		const parse = detectAxisFormat(grid[i]);
		if (parse && (!best || parse.score > best.parse.score)) {
			best = { orientation, axisIndex: i, parse };
		}
	}
	return best;
}

// Try both orientations. Returns null when the sheet has no time axis.
export function detectTimeAxis(rows: string[][]): TimeAxisHit | null {
	const h = detectTimeAxisFor(rows, 'horizontal');
	const v = detectTimeAxisFor(rows, 'vertical');
	if (!h) return v;
	if (!v) return h;
	return v.parse.score > h.parse.score ? v : h;
}

// Fallback when no dates exist anywhere: tall sheets are usually
// long-format (labels in a column), wide sheets the opposite.
export function guessOrientation(rows: string[][]): Orientation {
	const width = rows.reduce((w, r) => Math.max(w, r.length), 0);
	return rows.length > width ? 'vertical' : 'horizontal';
}

export interface Analysis {
	grid: string[][];
	axisCells: string[];
	format: DateFormat | null;
	dates: (Date | null)[] | null;
	positions: number[]; // axis indices that hold plottable labels
	candidates: number[]; // grid rows with enough numeric cells to plot
	nonEmptyAxisCells: number;
	skipped: string[]; // non-empty axis cells that failed to parse (time mode)
}

export function analyze(rows: string[][], mapping: Mapping, mode: ChartMode): Analysis {
	const grid = gridFor(rows, mapping.orientation);
	const axisCells = grid[mapping.axisIndex] ?? [];
	const nonEmptyAxisCells = axisCells.filter((c) => c && c.trim()).length;

	let format: DateFormat | null = null;
	let dates: (Date | null)[] | null = null;
	let positions: number[] = [];
	let skipped: string[] = [];

	if (mode === 'time') {
		format = mapping.formatOverride ? makeTokenFormat(mapping.formatOverride) : (detectAxisFormat(axisCells)?.format ?? null);
		if (format) {
			dates = parseAxisWith(axisCells, format).dates;
			positions = dates.flatMap((d, i) => (d ? [i] : []));
			const failed = axisCells.filter((c, i) => c && c.trim() && !dates![i]);
			skipped = [...new Set(failed)];
		}
	} else {
		const numericAnywhere = new Set<number>();
		grid.forEach((row, r) => {
			if (r === mapping.axisIndex) return;
			row.forEach((cell, i) => {
				if (toNumber(cell) !== null) numericAnywhere.add(i);
			});
		});
		positions = axisCells.flatMap((c, i) => (c && c.trim() && numericAnywhere.has(i) ? [i] : []));
	}

	const candidates = grid.flatMap((row, r) => {
		if (r === mapping.axisIndex || positions.length === 0) return [];
		const numeric = positions.filter((p) => toNumber(row[p]) !== null).length;
		return numeric >= Math.max(1, positions.length * 0.3) ? [r] : [];
	});

	return { grid, axisCells, format, dates, positions, candidates, nonEmptyAxisCells, skipped };
}

// Series name = the non-empty header cells sitting before the data range,
// e.g. ["종로구", "총인구수[명]"] → "종로구 · 총인구수[명]".
export function seriesLabel(analysis: Analysis, row: number, fallbackPrefix: string): string {
	const firstPos = analysis.positions[0] ?? 0;
	const parts = (analysis.grid[row] ?? [])
		.slice(0, firstPos)
		.map((s) => s.trim())
		.filter(Boolean);
	const unique = [...new Set(parts)];
	return unique.length > 0 ? unique.join(' · ') : `${fallbackPrefix} ${row + 1}`;
}
