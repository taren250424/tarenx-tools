import { makeStereogram, type PatternMode } from "./stereogram.ts";
import "../../shared/ads/ad-slot.css";
import "./main.css";

// ------------------------------------------------------------- theme

function applyTheme(isDark: boolean) {
  if (isDark) {
    document.documentElement.classList.remove("light");
  } else {
    document.documentElement.classList.add("light");
  }
}

function getInitialTheme(): boolean {
  const stored = localStorage.getItem("theme");
  if (stored === "light") return false;
  if (stored === "dark") return true;
  return !window.matchMedia("(prefers-color-scheme: light)").matches;
}

let isDarkMode = getInitialTheme();
applyTheme(isDarkMode);

const themeToggleBtn = document.getElementById("theme-toggle-btn")!;
themeToggleBtn.addEventListener("click", () => {
  isDarkMode = !isDarkMode;
  applyTheme(isDarkMode);
  localStorage.setItem("theme", isDarkMode ? "dark" : "light");
});

// ------------------------------------------------------------- app

const W = 880;
const H = 560;

const art = document.getElementById("art") as HTMLCanvasElement;
const answer = document.getElementById("answer") as HTMLCanvasElement;
const ctx = art.getContext("2d")!;
const actx = answer.getContext("2d")!;
const stage = document.getElementById("stage")!;
const badge = document.getElementById("badge")!;
const meta = document.getElementById("meta")!;
const nextBtn = document.getElementById("next") as HTMLButtonElement;
const revealBtn = document.getElementById("reveal") as HTMLButtonElement;
const expandBtn = document.getElementById("expand") as HTMLButtonElement;
const modeNav = document.getElementById("modes")!;
const viewer = document.getElementById("viewer")!;
const viewerImg = document.getElementById("viewer-img") as HTMLImageElement;

let modeSetting: "auto" | PatternMode = "auto";
let busy = false;

const MIN_SPIN = 550; // ms — generation is near-instant, but a beat of suspense is the point

const nextFrame = () =>
  new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function generate() {
  if (busy) return;
  busy = true;
  nextBtn.disabled = true;
  revealBtn.disabled = true;
  expandBtn.disabled = true;
  stage.classList.add("busy");
  stage.classList.remove("revealed");
  revealBtn.textContent = "Reveal";

  const started = performance.now();
  await nextFrame(); // let the veil fade in before we block on pixel work

  const mode: PatternMode =
    modeSetting === "auto"
      ? Math.random() < 0.5
        ? "dots"
        : "texture"
      : modeSetting;
  const result = makeStereogram(W, H, mode);

  const elapsed = performance.now() - started;
  if (elapsed < MIN_SPIN) await sleep(MIN_SPIN - elapsed);

  ctx.putImageData(result.image, 0, 0);
  actx.putImageData(result.answer, 0, 0);
  badge.textContent = result.label;
  meta.textContent = mode === "dots" ? "random dots" : "pattern texture";

  stage.classList.remove("busy");
  nextBtn.disabled = false;
  revealBtn.disabled = false;
  expandBtn.disabled = false;
  busy = false;
}

nextBtn.addEventListener("click", generate);

revealBtn.addEventListener("click", () => {
  const on = stage.classList.toggle("revealed");
  revealBtn.textContent = on ? "Back" : "Reveal";
});

// ------------------------------------------------------------- fullscreen viewer

function closeViewer() {
  viewer.hidden = true;
  document.body.classList.remove("viewer-open");
}

expandBtn.addEventListener("click", () => {
  viewerImg.src = art.toDataURL("image/png");
  viewer.hidden = false;
  document.body.classList.add("viewer-open");
});

viewer.addEventListener("click", closeViewer);

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !viewer.hidden) closeViewer();
});

modeNav.addEventListener("click", (e) => {
  const btn = (e.target as HTMLElement).closest<HTMLButtonElement>(
    "button[data-mode]"
  );
  if (!btn) return;
  modeSetting = btn.dataset.mode as "auto" | PatternMode;
  for (const b of modeNav.querySelectorAll("button")) {
    const on = b === btn;
    b.classList.toggle("on", on);
    b.setAttribute("aria-pressed", String(on));
  }
});

// wait for fonts so emoji glyphs rasterize before the first depth map
if (document.fonts?.ready) {
  document.fonts.ready.then(generate);
} else {
  generate();
}
