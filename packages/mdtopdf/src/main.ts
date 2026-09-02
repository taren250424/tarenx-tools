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
const previewScroll = $("preview-scroll");
const pages = $("pages");
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

// ---------------------------------------------------------------- pagination

const MM_TO_PX = 96 / 25.4;
const PAGE_MM = { width: 210, height: 297, marginY: 12, marginX: 14 };
const PAGE_WIDTH_PX = PAGE_MM.width * MM_TO_PX;

// html2pdf slices its capture into strips of this height, so a sheet has to
// be exactly this tall for the two to break in the same place.
const PAGE_BODY_PX = (PAGE_MM.height - PAGE_MM.marginY * 2) * MM_TO_PX;

const SPACER_CLASS = "page-spacer";
const KEEP_TOGETHER = ["avoid", "avoid-page"];

pages.style.setProperty("--page-body-height", `${PAGE_BODY_PX}px`);

// Pushes anything that would be split across two pages onto the next one, the
// way the pagebreak pass inside html2pdf does. Running it here instead leaves
// preview and PDF paginated by the same code against the same layout.
function insertPageSpacers(): void {
  for (const stale of preview.querySelectorAll(`.${SPACER_CLASS}`))
    stale.remove();

  const flowTop = preview.getBoundingClientRect().top;
  for (const el of preview.querySelectorAll<HTMLElement>("*")) {
    if (!KEEP_TOGETHER.includes(getComputedStyle(el).breakInside)) continue;

    const rect = el.getBoundingClientRect();
    if (rect.height > PAGE_BODY_PX) continue;

    const top = rect.top - flowTop;
    const startPage = Math.floor(top / PAGE_BODY_PX);
    if (Math.floor((rect.bottom - flowTop) / PAGE_BODY_PX) === startPage)
      continue;

    const spacer = document.createElement("div");
    spacer.className = SPACER_CLASS;
    spacer.style.height = `${PAGE_BODY_PX - (top % PAGE_BODY_PX)}px`;
    el.parentNode?.insertBefore(spacer, el);
  }
}

function paginate(): void {
  insertPageSpacers();

  const count = Math.max(1, Math.ceil(preview.offsetHeight / PAGE_BODY_PX));
  pages.replaceChildren(
    ...Array.from({ length: count }, (_, i) => {
      const flow = preview.cloneNode(true) as HTMLElement;
      flow.removeAttribute("id");
      flow.style.transform = `translateY(${-i * PAGE_BODY_PX}px)`;

      const body = document.createElement("div");
      body.className = "page-body";
      body.append(flow);

      const sheet = document.createElement("div");
      sheet.className = "page-sheet";
      sheet.append(body);

      const caption = document.createElement("p");
      caption.className = "page-caption";
      caption.textContent = `${i + 1} / ${count}`;

      const page = document.createElement("div");
      page.className = "page";
      page.append(sheet, caption);
      return page;
    })
  );
}

// The sheet is a fixed A4 width, so scale the stack down to fit rather than
// making the panel scroll sideways.
function fitPages(): void {
  const style = getComputedStyle(previewScroll);
  const available =
    previewScroll.clientWidth -
    parseFloat(style.paddingLeft) -
    parseFloat(style.paddingRight);
  if (available <= 0) return;
  pages.style.setProperty(
    "--page-zoom",
    String(Math.min(1, available / PAGE_WIDTH_PX))
  );
}

new ResizeObserver(fitPages).observe(previewScroll);

// ---------------------------------------------------------------- preview

function render(): void {
  const html = marked.parse(editor.value) as string;
  preview.innerHTML = DOMPurify.sanitize(html);
  paginate();

  // An image only takes up its real height once it has loaded, which moves
  // every break after it.
  for (const img of preview.querySelectorAll("img")) {
    if (img.complete) continue;
    img.addEventListener("load", paginate, { once: true });
    img.addEventListener("error", paginate, { once: true });
  }
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

  // html2pdf clones the element into a container of the same width the
  // preview is laid out at, so the capture matches the sheets on screen.
  try {
    await html2pdf()
      .set({
        margin: [PAGE_MM.marginY, PAGE_MM.marginX],
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
        // Off: insertPageSpacers() has already placed every break, and a
        // second pass would push the same elements one page further.
        pagebreak: { mode: [] },
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
// Web fonts arrive after the first render and take every line height with them.
void document.fonts.ready.then(paginate);
