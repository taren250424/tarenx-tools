import "../../shared/ads/ad-slot.css";
import "../../shared/footer/site-footer.css";
import "./main.css";
import { marked } from "marked";
import DOMPurify from "dompurify";
import html2pdf from "html2pdf.js";

marked.setOptions({ gfm: true, breaks: false });

const SAMPLE = `## Markdown to PDF

Write **Markdown** here, then hit **Download PDF**.
Nothing is uploaded — everything runs in your browser.
`;

const $ = <T extends HTMLElement>(id: string): T =>
  document.getElementById(id) as T;

const editor = $<HTMLTextAreaElement>("editor");
const preview = $("preview");
const fileInput = $<HTMLInputElement>("file-input");
const openBtn = $<HTMLButtonElement>("open-btn");
const downloadBtn = $<HTMLButtonElement>("download-btn");
const dropOverlay = $("drop-overlay");
const themeToggleBtn = $<HTMLButtonElement>("theme-toggle-btn");

const THEME_KEY = "mdtopdf-theme";

// The pre-paint script in index.html already resolved the theme and applied
// the class, so read it back rather than resolving it a second time here.
let isDarkMode = document.documentElement.classList.contains("dark");

themeToggleBtn.addEventListener("click", () => {
  isDarkMode = !isDarkMode;
  document.documentElement.classList.toggle("dark", isDarkMode);
  localStorage.setItem(THEME_KEY, isDarkMode ? "dark" : "light");
});

// Name of the last opened file, used as the default PDF filename.
let openedFileName = "";

// ---------------------------------------------------------------- preview

function render(): void {
  const html = marked.parse(editor.value) as string;
  preview.innerHTML = DOMPurify.sanitize(html);
}

let renderTimer = 0;
editor.addEventListener("input", () => {
  openedFileName = "";
  window.clearTimeout(renderTimer);
  renderTimer = window.setTimeout(render, 120);
});

// ---------------------------------------------------------------- file open

function loadFile(file: File): void {
  const reader = new FileReader();
  reader.onload = () => {
    editor.value = String(reader.result ?? "");
    openedFileName = file.name.replace(/\.(md|markdown|txt)$/i, "");
    render();
  };
  reader.readAsText(file);
}

openBtn.addEventListener("click", () => fileInput.click());
fileInput.addEventListener("change", () => {
  const file = fileInput.files?.[0];
  if (file) loadFile(file);
  fileInput.value = "";
});

let dragDepth = 0;
document.addEventListener("dragenter", (e) => {
  if (!e.dataTransfer?.types.includes("Files")) return;
  e.preventDefault();
  dragDepth++;
  dropOverlay.classList.remove("hidden");
});
document.addEventListener("dragover", (e) => e.preventDefault());
document.addEventListener("dragleave", () => {
  if (--dragDepth <= 0) {
    dragDepth = 0;
    dropOverlay.classList.add("hidden");
  }
});
document.addEventListener("drop", (e) => {
  e.preventDefault();
  dragDepth = 0;
  dropOverlay.classList.add("hidden");
  const file = e.dataTransfer?.files?.[0];
  if (file) loadFile(file);
});

// ---------------------------------------------------------------- pdf

function pdfFilename(): string {
  if (openedFileName) return `${openedFileName}.pdf`;
  const heading = preview.querySelector("h1, h2, h3")?.textContent?.trim();
  if (heading)
    return `${heading.slice(0, 60).replace(/[\\/:*?"<>|]/g, "")}.pdf`;
  return "document.pdf";
}

async function downloadPdf(): Promise<void> {
  if (!editor.value.trim()) return;

  downloadBtn.disabled = true;
  const label = downloadBtn.innerHTML;
  downloadBtn.innerHTML = "Generating…";

  // html2pdf clones the element into its own A4-width container, so the
  // visible preview can be passed directly regardless of panel size.
  try {
    await html2pdf()
      .set({
        margin: [12, 14],
        filename: pdfFilename(),
        image: { type: "jpeg", quality: 0.96 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          scrollX: 0,
          scrollY: 0,
          backgroundColor: "#ffffff",
        },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        pagebreak: { mode: ["css", "legacy"] },
      })
      .from(preview)
      .save();
  } finally {
    downloadBtn.disabled = false;
    downloadBtn.innerHTML = label;
  }
}

downloadBtn.addEventListener("click", () => void downloadPdf());

// ---------------------------------------------------------------- init

editor.value = SAMPLE;
render();
