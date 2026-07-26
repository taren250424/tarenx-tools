import { Chart, registerables } from "chart.js";
import type { ChartConfiguration, TooltipItem } from "chart.js";
import "chartjs-adapter-date-fns";
import { format as formatDate } from "date-fns";
import type { ChartMode } from "./detect.ts";

Chart.register(...registerables);

export interface SeriesSpec {
  label: string;
  color: string;
  // x = epoch ms (time mode) or category label (category mode)
  points: { x: number | string; y: number | null }[];
}

export interface ChartSpec {
  mode: ChartMode;
  indexed: boolean;
  series: SeriesSpec[];
  categories: string[]; // union of category labels (category mode)
  rawLabels: Map<number, string>; // timestamp → original CSV label (time mode)
  yLabel: string; // unit of the plotted values, shown as the Y-axis title
}

const PALETTE = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
  "#f97316",
  "#6366f1",
  "#84cc16",
  "#06b6d4",
  "#d946ef",
];

export const defaultColor = (i: number): string => PALETTE[i % PALETTE.length];

type TimeUnit = "day" | "month" | "quarter" | "year";

const DAY_MS = 24 * 60 * 60 * 1000;

function pickTimeUnit(series: SeriesSpec[]): TimeUnit {
  const times = [
    ...new Set(series.flatMap((s) => s.points.map((p) => Number(p.x)))),
  ].sort((a, b) => a - b);
  if (times.length < 2) return "month";
  const gaps = [];
  for (let i = 1; i < times.length; i++) gaps.push(times[i] - times[i - 1]);
  gaps.sort((a, b) => a - b);
  const median = gaps[Math.floor(gaps.length / 2)] / DAY_MS;
  if (median <= 2) return "day";
  if (median <= 45) return "month";
  if (median <= 150) return "quarter";
  return "year";
}

interface IndexedPoint {
  x: number | string;
  y: number | null;
  raw: number | null;
}

// Rebase each series so its first non-null, non-zero value = 100;
// keeps the actual value on the point for tooltips.
function applyIndexing(points: SeriesSpec["points"]): IndexedPoint[] {
  const base = points.find((p) => p.y !== null && p.y !== 0)?.y;
  return points.map((p) => ({
    x: p.x,
    y: p.y !== null && base ? (p.y / base) * 100 : p.y,
    raw: p.y,
  }));
}

function cssVar(name: string): string {
  return getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
}

let instance: Chart | null = null;

export function renderChart(canvas: HTMLCanvasElement, spec: ChartSpec): void {
  instance?.destroy();
  instance = null;
  if (spec.series.length === 0) return;

  const isTime = spec.mode === "time";
  const indexed = spec.indexed && isTime;
  const gridColor = cssVar("--chart-grid");
  const tickColor = cssVar("--text-secondary");
  const textColor = cssVar("--text-color");

  const datasets = spec.series.map((s) => ({
    label: s.label,
    data: indexed ? applyIndexing(s.points) : s.points,
    borderColor: s.color,
    backgroundColor: isTime ? "transparent" : s.color,
    borderWidth: isTime ? 2 : 1,
    pointRadius: 2,
    tension: 0.1,
  }));

  const numberFmt = (v: number) =>
    v.toLocaleString(undefined, { maximumFractionDigits: 2 });

  const timeUnit = pickTimeUnit(spec.series);
  const TICK_PATTERNS: Record<TimeUnit, string> = {
    day: "yyyy-MM-dd",
    month: "yyyy-MM",
    quarter: "yyyy QQQ",
    year: "yyyy",
  };
  // Ticks show the original CSV notation ("2011.1/4", "2012 년") when the
  // tick lands on a data point; the date-fns pattern is only a fallback.
  const timeLabel = (value: unknown) =>
    spec.rawLabels.get(Number(value)) ??
    formatDate(new Date(Number(value)), TICK_PATTERNS[timeUnit]);
  const yTitle = indexed ? "Index (baseline = 100)" : spec.yLabel || "Value";

  // Category-mode points use string x values, which Chart.js supports at
  // runtime but its ChartConfiguration generics don't model — hence the cast.
  const config = {
    type: isTime ? "line" : "bar",
    data: { labels: isTime ? undefined : spec.categories, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      normalized: true,
      scales: {
        x: isTime
          ? {
              type: "time",
              time: {
                unit: timeUnit,
                displayFormats: {
                  day: "yyyy-MM-dd",
                  month: "yyyy-MM",
                  quarter: "yyyy QQQ",
                  year: "yyyy",
                },
              },
              grid: { color: gridColor },
              // source: 'data' puts ticks on actual data points, so the
              // original CSV labels can be shown verbatim.
              ticks: {
                source: "data",
                color: tickColor,
                maxRotation: 0,
                autoSkip: true,
                autoSkipPadding: 16,
                callback: timeLabel,
              },
            }
          : {
              type: "category",
              grid: { color: gridColor },
              ticks: { color: tickColor },
            },
        y: {
          title: { display: true, text: yTitle, color: tickColor },
          grid: { color: gridColor },
          ticks: { color: tickColor },
        },
      },
      plugins: {
        legend: { labels: { color: textColor, boxWidth: 24, boxHeight: 2 } },
        tooltip: {
          callbacks: {
            ...(isTime
              ? {
                  title: (items: TooltipItem<"bar" | "line">[]) =>
                    items.length > 0 ? timeLabel(items[0].parsed.x) : "",
                }
              : {}),
            label: (ctx: TooltipItem<"bar" | "line">) => {
              const point = ctx.raw as IndexedPoint;
              if (point.y === null) return `${ctx.dataset.label}: —`;
              if (indexed && point.raw !== null && point.raw !== undefined) {
                return `${ctx.dataset.label}: ${numberFmt(point.y)} (actual ${numberFmt(point.raw)})`;
              }
              return `${ctx.dataset.label}: ${numberFmt(point.y)}`;
            },
          },
        },
      },
    },
  };

  instance = new Chart(canvas, config as unknown as ChartConfiguration);
}

export function clearChart(): void {
  instance?.destroy();
  instance = null;
}

// Exports the current chart as PNG. The chart canvas itself is transparent,
// so it is composited onto the panel background color first.
export function chartToPngBlob(): Promise<Blob | null> {
  if (!instance) return Promise.resolve(null);
  const src = instance.canvas;
  const out = document.createElement("canvas");
  out.width = src.width;
  out.height = src.height;
  const ctx = out.getContext("2d")!;
  ctx.fillStyle = cssVar("--panel-bg") || "#ffffff";
  ctx.fillRect(0, 0, out.width, out.height);
  ctx.drawImage(src, 0, 0);
  return new Promise((resolve) => out.toBlob(resolve, "image/png"));
}
