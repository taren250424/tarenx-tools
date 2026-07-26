import type { Analysis, Mapping } from "./detect.ts";

const MAX_ROWS = 300;
const MAX_COLS = 60;

export interface TableCallbacks {
  setAxis(gridIndex: number): void;
  toggleSeries(gridIndex: number, on: boolean): void;
  setColor(gridIndex: number, color: string): void;
}

const esc = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

function colName(i: number): string {
  let n = i + 1;
  let s = "";
  while (n > 0) {
    const r = (n - 1) % 26;
    s = String.fromCharCode(65 + r) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
}

// Renders the raw sheet with mapping controls attached to grid lines:
// horizontal → a control cell per row; vertical → a control row per column.
// The radio picks the X-axis line, the checkbox plots the line as a series.
export function renderTable(
  container: HTMLElement,
  rows: string[][],
  mapping: Mapping,
  analysis: Analysis,
  seriesColors: Map<number, string>,
  callbacks: TableCallbacks
): void {
  const width = rows.reduce((w, r) => Math.max(w, r.length), 0);
  const shownRows = Math.min(rows.length, MAX_ROWS);
  const shownCols = Math.min(width, MAX_COLS);
  const horizontal = mapping.orientation === "horizontal";
  const failedAxisCells = new Set(
    analysis.dates
      ? analysis.axisCells.flatMap((c, i) =>
          c && c.trim() && !analysis.dates![i] ? [i] : []
        )
      : []
  );

  const controls = (gridIndex: number) => {
    const isAxis = gridIndex === mapping.axisIndex;
    const isCandidate = analysis.candidates.includes(gridIndex);
    const isSelected = mapping.selected.has(gridIndex);
    const swatch = isSelected
      ? `<label title="Series color"><input type="color" data-color="${gridIndex}" value="${seriesColors.get(gridIndex) ?? "#888888"}"></label>`
      : "";
    return (
      `<label title="Use as X axis"><input type="radio" name="axis" data-axis="${gridIndex}"${isAxis ? " checked" : ""}></label>` +
      `<label title="Plot as series"><input type="checkbox" data-series="${gridIndex}"${
        isSelected ? " checked" : ""
      }${isAxis ? " disabled" : ""}${!isAxis && !isCandidate ? ' class="not-candidate"' : ""}></label>` +
      swatch
    );
  };

  const rowClass = (gridIndex: number) =>
    gridIndex === mapping.axisIndex
      ? "is-axis"
      : mapping.selected.has(gridIndex)
        ? "is-series"
        : "";

  let html = '<table class="data-table"><thead><tr><th class="corner"></th>';
  if (horizontal) html += '<th class="corner"></th>';
  for (let c = 0; c < shownCols; c++) {
    html += `<th class="${!horizontal ? rowClass(c) : ""}">${colName(c)}</th>`;
  }
  html += "</tr>";
  if (!horizontal) {
    html += '<tr class="control-row"><th class="corner"></th>';
    for (let c = 0; c < shownCols; c++)
      html += `<th class="ctl">${controls(c)}</th>`;
    html += "</tr>";
  }
  html += "</thead><tbody>";

  for (let r = 0; r < shownRows; r++) {
    const row = rows[r];
    html += `<tr class="${horizontal ? rowClass(r) : ""}">`;
    if (horizontal) html += `<td class="ctl">${controls(r)}</td>`;
    html += `<th class="rownum">${r + 1}</th>`;
    for (let c = 0; c < shownCols; c++) {
      const gridIndex = horizontal ? r : c;
      const posIndex = horizontal ? c : r;
      const onAxisLine = gridIndex === mapping.axisIndex;
      const failed = onAxisLine && failedAxisCells.has(posIndex);
      const colCls = !horizontal ? rowClass(c) : "";
      html += `<td class="${colCls}${failed ? " cell-skip" : ""}">${esc(row[c] ?? "")}</td>`;
    }
    html += "</tr>";
  }
  html += "</tbody></table>";

  if (rows.length > shownRows || width > shownCols) {
    html += `<p class="table-note">Showing ${shownRows} of ${rows.length} rows × ${shownCols} of ${width} columns — the chart still uses the full data.</p>`;
  }

  container.innerHTML = html;

  container
    .querySelectorAll<HTMLInputElement>("input[data-axis]")
    .forEach((el) => {
      el.addEventListener("change", () =>
        callbacks.setAxis(Number(el.dataset.axis))
      );
    });
  container
    .querySelectorAll<HTMLInputElement>("input[data-series]")
    .forEach((el) => {
      el.addEventListener("change", () =>
        callbacks.toggleSeries(Number(el.dataset.series), el.checked)
      );
    });
  container
    .querySelectorAll<HTMLInputElement>("input[data-color]")
    .forEach((el) => {
      el.addEventListener("change", () =>
        callbacks.setColor(Number(el.dataset.color), el.value)
      );
    });
}
