import "./main.css";
import { decodeBuffer, parseCsv } from "./csv.ts";
import type { Analysis, ChartMode, Mapping, Orientation } from "./detect.ts";
import {
  analyze,
  detectTimeAxis,
  detectTimeAxisFor,
  guessOrientation,
  seriesLabel,
  toNumber,
} from "./detect.ts";
import type { SeriesSpec } from "./chart.ts";
import {
  chartToPngBlob,
  clearChart,
  defaultColor,
  renderChart,
} from "./chart.ts";
import { renderTable } from "./table.ts";

interface Source {
  id: number;
  name: string;
  buffer: ArrayBuffer | null; // null for pasted text
  encodingChoice: string; // 'auto' | 'utf-8' | 'euc-kr'
  detectedEncoding: string;
  rows: string[][];
  mapping: Mapping;
}

// Only the first few candidates are plotted on load; the "All" button in
// the report bar plots everything.
const AUTO_SELECT_LIMIT = 3;

let sources: Source[] = [];
let activeId = -1;
let mode: ChartMode = "time";
let indexed = false;
let yLabel = "";
let nextId = 1;
let pasteCount = 0;
// Effective color of every plotted series, keyed "sourceId:gridRow" —
// refreshed on each chart render so the table swatches match the chart.
let assignedColors = new Map<string, string>();

const $ = <T extends HTMLElement>(id: string): T =>
  document.getElementById(id) as T;

const els = {
  emptyState: () => $("empty-state"),
  workspace: () => $("workspace"),
  tabs: () => $("source-tabs"),
  report: () => $("report-bar"),
  tableWrap: () => $("table-wrap"),
  canvas: () => $<HTMLCanvasElement>("chart"),
  chartEmpty: () => $("chart-empty"),
  fileInput: () => $<HTMLInputElement>("file-input"),
  dropOverlay: () => $("drop-overlay"),
  modeTimeBtn: () => $<HTMLButtonElement>("mode-time-btn"),
  modeCategoryBtn: () => $<HTMLButtonElement>("mode-category-btn"),
  indexBtn: () => $<HTMLButtonElement>("index-btn"),
};

const activeSource = () => sources.find((s) => s.id === activeId) ?? null;

// ---------------------------------------------------------------- sources

function configureMapping(
  source: Source,
  forced?: Orientation,
  updateMode = false
): void {
  const hit = forced
    ? detectTimeAxisFor(source.rows, forced)
    : detectTimeAxis(source.rows);
  const orientation =
    forced ?? (hit ? hit.orientation : guessOrientation(source.rows));
  source.mapping = {
    orientation,
    axisIndex: hit ? hit.axisIndex : 0,
    selected: new Set(),
    colors: new Map(),
    formatOverride: null,
  };
  if (updateMode) mode = hit ? "time" : "category";
  const analysis = analyze(source.rows, source.mapping, mode);
  for (const row of analysis.candidates.slice(0, AUTO_SELECT_LIMIT))
    source.mapping.selected.add(row);
}

function addSource(
  name: string,
  buffer: ArrayBuffer | null,
  text: string
): void {
  const rows = parseCsv(text);
  if (rows.length === 0 || rows.every((r) => r.every((c) => !c.trim()))) {
    alert(`No data found in "${name}".`);
    return;
  }
  const source: Source = {
    id: nextId++,
    name,
    buffer,
    encodingChoice: "auto",
    detectedEncoding: buffer ? decodeBuffer(buffer, "auto").encoding : "utf-8",
    rows,
    mapping: {
      orientation: "horizontal",
      axisIndex: 0,
      selected: new Set(),
      colors: new Map(),
      formatOverride: null,
    },
  };
  configureMapping(source, undefined, sources.length === 0);
  sources.push(source);
  activeId = source.id;
  renderAll();
}

async function addFile(file: File): Promise<void> {
  const buffer = await file.arrayBuffer();
  const { text } = decodeBuffer(buffer, "auto");
  addSource(file.name, buffer, text);
}

function removeSource(id: number): void {
  sources = sources.filter((s) => s.id !== id);
  if (activeId === id)
    activeId = sources.length > 0 ? sources[sources.length - 1].id : -1;
  renderAll();
}

function changeEncoding(source: Source, choice: string): void {
  if (!source.buffer) return;
  source.encodingChoice = choice;
  const { text, encoding } = decodeBuffer(source.buffer, choice);
  source.detectedEncoding = encoding;
  source.rows = parseCsv(text);
  configureMapping(source);
  renderAll();
}

// ---------------------------------------------------------------- rendering

function renderAll(): void {
  const hasSources = sources.length > 0;
  els.emptyState().classList.toggle("hidden", hasSources);
  els.workspace().classList.toggle("hidden", !hasSources);
  els.modeTimeBtn().setAttribute("aria-pressed", String(mode === "time"));
  els
    .modeCategoryBtn()
    .setAttribute("aria-pressed", String(mode === "category"));
  els.indexBtn().setAttribute("aria-pressed", String(indexed));
  els.indexBtn().disabled = mode !== "time";
  if (!hasSources) {
    clearChart();
    return;
  }
  renderTabs();
  // Chart first: it assigns the series colors the table swatches display.
  renderChartFromSources();
  renderActive();
}

function renderTabs(): void {
  const wrap = els.tabs();
  wrap.innerHTML = "";
  for (const source of sources) {
    const tab = document.createElement("button");
    tab.className = `tab${source.id === activeId ? " active" : ""}`;
    tab.title = source.name;
    const label = document.createElement("span");
    label.textContent = source.name;
    const close = document.createElement("span");
    close.className = "tab-close";
    close.textContent = "×";
    close.title = "Remove";
    close.addEventListener("click", (e) => {
      e.stopPropagation();
      removeSource(source.id);
    });
    tab.append(label, close);
    tab.addEventListener("click", () => {
      activeId = source.id;
      renderAll();
    });
    wrap.appendChild(tab);
  }
  const add = document.createElement("button");
  add.className = "tab tab-add";
  add.textContent = "+";
  add.title = "Add file";
  add.addEventListener("click", () => els.fileInput().click());
  wrap.appendChild(add);
}

function renderActive(): void {
  const source = activeSource();
  if (!source) return;
  const analysis = analyze(source.rows, source.mapping, mode);
  renderReport(source, analysis);
  const seriesColors = new Map<number, string>();
  for (const row of source.mapping.selected) {
    const color =
      assignedColors.get(`${source.id}:${row}`) ??
      source.mapping.colors.get(row);
    if (color) seriesColors.set(row, color);
  }
  renderTable(
    els.tableWrap(),
    source.rows,
    source.mapping,
    analysis,
    seriesColors,
    {
      setAxis(gridIndex) {
        source.mapping.selected.delete(gridIndex);
        source.mapping.axisIndex = gridIndex;
        renderAll();
      },
      toggleSeries(gridIndex, on) {
        if (on) source.mapping.selected.add(gridIndex);
        else source.mapping.selected.delete(gridIndex);
        renderAll();
      },
      setColor(gridIndex, color) {
        source.mapping.colors.set(gridIndex, color);
        renderAll();
      },
    }
  );
}

function segButton(
  label: string,
  pressed: boolean,
  onClick: () => void
): HTMLButtonElement {
  const btn = document.createElement("button");
  btn.className = "seg-btn";
  btn.textContent = label;
  btn.setAttribute("aria-pressed", String(pressed));
  btn.addEventListener("click", onClick);
  return btn;
}

function renderReport(source: Source, analysis: Analysis): void {
  const parsed = analysis.positions.length;
  const nonEmpty = analysis.nonEmptyAxisCells;
  const skipped = analysis.skipped;
  const formatLabel = analysis.format?.label ?? null;
  const bar = els.report();
  bar.innerHTML = "";

  const orientationWrap = document.createElement("div");
  orientationWrap.className = "segmented";
  orientationWrap.setAttribute("aria-label", "X-axis direction");
  const inRows = segButton(
    "Series in rows",
    source.mapping.orientation === "horizontal",
    () => {
      configureMapping(source, "horizontal");
      renderAll();
    }
  );
  inRows.title =
    "Each row is one series; X-axis labels (dates/categories) run along a row";
  const inColumns = segButton(
    "Series in columns",
    source.mapping.orientation === "vertical",
    () => {
      configureMapping(source, "vertical");
      renderAll();
    }
  );
  inColumns.title =
    "Each column is one series; X-axis labels (dates/categories) run down a column";
  orientationWrap.append(inRows, inColumns);
  bar.appendChild(orientationWrap);

  if (source.buffer) {
    const select = document.createElement("select");
    select.className = "encoding-select";
    select.title = "File encoding";
    for (const [value, label] of [
      ["auto", `Auto (${source.detectedEncoding.toUpperCase()})`],
      ["utf-8", "UTF-8"],
      ["euc-kr", "EUC-KR / CP949"],
    ]) {
      const opt = document.createElement("option");
      opt.value = value;
      opt.textContent = label;
      opt.selected = source.encodingChoice === value;
      select.appendChild(opt);
    }
    select.addEventListener("change", () =>
      changeEncoding(source, select.value)
    );
    bar.appendChild(select);
  }

  const selectAll = document.createElement("button");
  selectAll.className = "btn btn-secondary btn-small";
  selectAll.textContent = `All (${analysis.candidates.length})`;
  selectAll.title = "Plot every candidate series";
  selectAll.addEventListener("click", () => {
    for (const row of analysis.candidates) source.mapping.selected.add(row);
    renderAll();
  });
  const clearAll = document.createElement("button");
  clearAll.className = "btn btn-secondary btn-small";
  clearAll.textContent = "None";
  clearAll.title = "Unplot all series";
  clearAll.addEventListener("click", () => {
    source.mapping.selected.clear();
    renderAll();
  });
  bar.append(selectAll, clearAll);

  const status = document.createElement("span");
  status.className = "report-status";
  if (mode === "time") {
    if (!formatLabel) {
      status.textContent =
        "No time format detected on the X-axis line — pick another line, enter a format, or switch to Bars · Category.";
      status.classList.add("report-warn");
    } else {
      const skippedNote =
        skipped.length > 0
          ? ` · skipped: ${skipped.slice(0, 4).join(", ")}${skipped.length > 4 ? "…" : ""}`
          : "";
      status.textContent = `Format: ${formatLabel}${source.mapping.formatOverride ? "" : " · auto-detected"} · ${parsed}/${nonEmpty} labels parsed${skippedNote}`;
      if (parsed < nonEmpty) status.classList.add("report-warn");
    }
  } else {
    status.textContent = `${parsed} categories on the X axis`;
  }
  bar.appendChild(status);

  if (mode === "time") {
    const overrideWrap = document.createElement("span");
    overrideWrap.className = "format-override";
    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = "Format override, e.g. YYYY.MM";
    input.value = source.mapping.formatOverride ?? "";
    input.title =
      "Tokens: YYYY, MM, DD, Q — numbers in each label are matched to tokens in order";
    const apply = () => {
      source.mapping.formatOverride = input.value.trim() || null;
      renderAll();
    };
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") apply();
    });
    const applyBtn = document.createElement("button");
    applyBtn.className = "btn btn-secondary btn-small";
    applyBtn.textContent = "Apply";
    applyBtn.addEventListener("click", apply);
    overrideWrap.append(input, applyBtn);
    bar.appendChild(overrideWrap);
  }
}

function renderChartFromSources(): void {
  const series: SeriesSpec[] = [];
  const categories: string[] = [];
  const seenCategories = new Set<string>();
  const nextAssigned = new Map<string, string>();
  const rawLabels = new Map<number, string>();

  for (const source of sources) {
    const analysis = analyze(source.rows, source.mapping, mode);
    if (analysis.positions.length === 0) continue;
    if (mode === "category") {
      for (const p of analysis.positions) {
        const label = analysis.axisCells[p];
        if (!seenCategories.has(label)) {
          seenCategories.add(label);
          categories.push(label);
        }
      }
    } else {
      for (const p of analysis.positions) {
        const t = analysis.dates![p]!.getTime();
        if (!rawLabels.has(t)) rawLabels.set(t, analysis.axisCells[p].trim());
      }
    }
    const prefix = sources.length > 1 ? `${source.name}: ` : "";
    const fallback =
      source.mapping.orientation === "horizontal" ? "Row" : "Column";
    for (const row of [...source.mapping.selected].sort((a, b) => a - b)) {
      if (!analysis.grid[row]) continue;
      const points = analysis.positions.map((p) => ({
        x:
          mode === "time"
            ? analysis.dates![p]!.getTime()
            : analysis.axisCells[p],
        y: toNumber(analysis.grid[row][p]),
      }));
      if (points.some((pt) => pt.y !== null)) {
        const color =
          source.mapping.colors.get(row) ?? defaultColor(series.length);
        nextAssigned.set(`${source.id}:${row}`, color);
        series.push({
          label: prefix + seriesLabel(analysis, row, fallback),
          color,
          points,
        });
      }
    }
  }
  assignedColors = nextAssigned;

  els.chartEmpty().classList.toggle("hidden", series.length > 0);
  if (series.length === 0) {
    clearChart();
    return;
  }
  renderChart(els.canvas(), {
    mode,
    indexed,
    series,
    categories,
    rawLabels,
    yLabel,
  });
}

// ---------------------------------------------------------------- events

function bindEvents(): void {
  $("open-btn").addEventListener("click", () => els.fileInput().click());
  $("dropzone").addEventListener("click", () => els.fileInput().click());
  $("dropzone").addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") els.fileInput().click();
  });

  els.fileInput().addEventListener("change", async () => {
    const files = [...(els.fileInput().files ?? [])];
    els.fileInput().value = "";
    for (const file of files) await addFile(file);
  });

  els.modeTimeBtn().addEventListener("click", () => {
    mode = "time";
    renderAll();
  });
  els.modeCategoryBtn().addEventListener("click", () => {
    mode = "category";
    renderAll();
  });
  els.indexBtn().addEventListener("click", () => {
    indexed = !indexed;
    renderAll();
  });
  const yLabelInput = $<HTMLInputElement>("y-unit-input");
  yLabelInput.addEventListener("input", () => {
    yLabel = yLabelInput.value.trim();
    renderChartFromSources();
  });

  $("export-btn").addEventListener("click", async () => {
    const blob = await chartToPngBlob();
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "graphify-chart.png";
    a.click();
    URL.revokeObjectURL(url);
  });

  // Paste cells straight from a spreadsheet (arrives as TSV).
  window.addEventListener("paste", (e) => {
    if (
      e.target instanceof Element &&
      e.target.closest("input, textarea, select")
    )
      return;
    const text = e.clipboardData?.getData("text/plain") ?? "";
    if (!text.trim()) return;
    e.preventDefault();
    addSource(`Pasted ${++pasteCount}`, null, text);
  });

  // Drag & drop anywhere on the page.
  let dragDepth = 0;
  window.addEventListener("dragenter", (e) => {
    e.preventDefault();
    dragDepth++;
    els.dropOverlay().classList.remove("hidden");
  });
  window.addEventListener("dragover", (e) => e.preventDefault());
  window.addEventListener("dragleave", () => {
    dragDepth = Math.max(0, dragDepth - 1);
    if (dragDepth === 0) els.dropOverlay().classList.add("hidden");
  });
  window.addEventListener("drop", async (e) => {
    e.preventDefault();
    dragDepth = 0;
    els.dropOverlay().classList.add("hidden");
    for (const file of [...(e.dataTransfer?.files ?? [])]) await addFile(file);
  });

  // Draggable splitter between the sheet panel and the chart panel.
  const SPLIT_KEY = "graphify-split";
  const dataPanel = document.querySelector<HTMLElement>(".data-panel");
  const handle = $("split-handle");
  if (dataPanel) {
    const saved = localStorage.getItem(SPLIT_KEY);
    if (saved) dataPanel.style.height = saved;
    handle.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      handle.setPointerCapture(e.pointerId);
      handle.classList.add("dragging");
      const startY = e.clientY;
      const startHeight = dataPanel.getBoundingClientRect().height;
      const onMove = (ev: PointerEvent) => {
        const height = Math.min(
          Math.max(160, startHeight + ev.clientY - startY),
          window.innerHeight * 0.8
        );
        dataPanel.style.height = `${height}px`;
      };
      const onUp = () => {
        handle.classList.remove("dragging");
        handle.removeEventListener("pointermove", onMove);
        handle.removeEventListener("pointerup", onUp);
        localStorage.setItem(SPLIT_KEY, dataPanel.style.height);
      };
      handle.addEventListener("pointermove", onMove);
      handle.addEventListener("pointerup", onUp);
    });
  }

  // Theme toggle, chart re-rendered to pick up the new CSS variables.
  const THEME_KEY = "graphify-theme";
  // Light is the default (:root); dark is opt-in via the .dark class.
  if (localStorage.getItem(THEME_KEY) === "dark")
    document.documentElement.classList.add("dark");
  $("theme-toggle-btn").addEventListener("click", () => {
    const dark = document.documentElement.classList.toggle("dark");
    localStorage.setItem(THEME_KEY, dark ? "dark" : "light");
    if (sources.length > 0) renderChartFromSources();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  bindEvents();
  renderAll();
});
