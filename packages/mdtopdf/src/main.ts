import "../../shared/ads/ad-slot.css";
import "../../shared/footer/site-footer.css";
import "./main.css";
import { marked } from "marked";
import DOMPurify from "dompurify";
import html2pdf from "html2pdf.js";
import { jsPDF } from "jspdf";

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
const CONTENT_MM = {
  width: PAGE_MM.width - PAGE_MM.marginX * 2,
  height: PAGE_MM.height - PAGE_MM.marginY * 2,
};
const PAGE_BODY_PX = CONTENT_MM.height * MM_TO_PX;

const KEEP_TOGETHER = ["avoid", "avoid-page"];

// Offsets into the rendered document where each page starts, the last entry
// being its full height. Both the sheets and the PDF are cut from this.
let pageBreaks: number[] = [0, 0];

type Span = [top: number, bottom: number];

// Every stretch of the document a page break may not pass through: one per
// line of text, plus each element the stylesheet marks unbreakable. An element
// taller than a page is left out — it has to be broken somewhere, and the
// lines or rows inside it are the better place.
function unbreakableSpans(): Span[] {
  const flowTop = preview.getBoundingClientRect().top;
  const spans: Span[] = [];

  const lines = document.createRange();
  const walker = document.createTreeWalker(preview, NodeFilter.SHOW_TEXT);
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    if (!node.textContent?.trim()) continue;
    lines.selectNodeContents(node);
    for (const rect of lines.getClientRects())
      if (rect.height) spans.push([rect.top - flowTop, rect.bottom - flowTop]);
  }

  for (const el of preview.querySelectorAll<HTMLElement>("*")) {
    if (!KEEP_TOGETHER.includes(getComputedStyle(el).breakInside)) continue;
    const rect = el.getBoundingClientRect();
    if (rect.height > PAGE_BODY_PX) continue;
    spans.push([rect.top - flowTop, rect.bottom - flowTop]);
  }

  // Merge the ones that overlap, so a single lookup answers "may I cut here".
  // Only strict overlaps: consecutive lines touch exactly, and the seam
  // between them is the very place a break belongs.
  spans.sort((a, b) => a[0] - b[0]);
  const merged: Span[] = [];
  for (const span of spans) {
    const last = merged[merged.length - 1];
    if (last && span[0] < last[1]) last[1] = Math.max(last[1], span[1]);
    else merged.push([...span]);
  }
  return merged;
}

function computePageBreaks(): number[] {
  const spans = unbreakableSpans();
  const total = preview.offsetHeight;
  const breaks = [0];

  for (let start = 0; start < total;) {
    const limit = start + PAGE_BODY_PX;
    if (limit >= total) break;

    // Walk back to the first cut that splits nothing. Each step lands on the
    // top of an offending span, so it always moves up and always terminates.
    let end = limit;
    for (const [top, bottom] of spans) if (top < end && end < bottom) end = top;

    // A single span longer than a page: nothing to be done but cut it.
    breaks.push(end > start ? end : limit);
    start = breaks[breaks.length - 1];
  }

  breaks.push(total);
  return breaks;
}

function paginate(): void {
  pageBreaks = computePageBreaks();

  const count = pageBreaks.length - 1;
  pages.replaceChildren(
    ...Array.from({ length: count }, (_, i) => {
      const flow = preview.cloneNode(true) as HTMLElement;
      flow.removeAttribute("id");
      flow.style.transform = `translateY(${-pageBreaks[i]}px)`;

      const body = document.createElement("div");
      body.className = "page-body";
      body.style.height = `${pageBreaks[i + 1] - pageBreaks[i]}px`;
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

// Rows a cut may pass through: blank ones, and ones holding nothing but the
// vertical rules of a table. Cell borders are far too light to register as
// ink, so the allowance only has to cover the odd antialiased pixel.
const CUT_REACH_PX = 60;
const CUT_ROW_INK = 8;

function clearCutRow(
  source: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  target: number,
  floor: number
): number {
  const from = Math.max(floor + 1, target - CUT_REACH_PX);
  if (target <= from) return target;

  const { data } = source.getImageData(0, from, canvas.width, target - from);
  for (let row = target - from - 1; row >= 0; row--) {
    let ink = 0;
    const base = row * canvas.width * 4;
    for (let x = 0; x < canvas.width; x++)
      if (data[base + x * 4] < 200 && ++ink > CUT_ROW_INK) break;
    if (ink <= CUT_ROW_INK) return from + row;
  }
  return target;
}

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

  try {
    // Only the capture is html2pdf's: it clones the element into a container
    // of the same width the preview is laid out at. Its own paginator would
    // cut the image at a fixed stride, through whatever line happens to sit
    // there, so the pages are cut from pageBreaks instead — the offsets the
    // sheets on screen are already showing.
    const canvas: HTMLCanvasElement = await html2pdf()
      .set({
        margin: [PAGE_MM.marginY, PAGE_MM.marginX],
        html2canvas: {
          scale: 2,
          useCORS: true,
          scrollX: 0,
          scrollY: 0,
          backgroundColor: "#ffffff",
        },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        // Off: it would pad every keep-together element that straddles a
        // fixed page stride onto the next one, stretching the clone past the
        // layout pageBreaks was measured on.
        pagebreak: { mode: [] },
      })
      .from(preview)
      .toCanvas()
      .get("canvas");

    // The capture also holds the bottom margin of the last block, which
    // collapses out of offsetHeight, and html2canvas rounds every box as it
    // rasterises — a fraction of a pixel per table row, which adds up over a
    // long one. Deriving the scale from the capture absorbs both.
    const trailing = preview.lastElementChild
      ? parseFloat(getComputedStyle(preview.lastElementChild).marginBottom)
      : 0;
    const scale = canvas.height / (preview.offsetHeight + trailing);
    const maxRows = Math.floor(PAGE_BODY_PX * scale);
    const source = canvas.getContext("2d", { willReadFrequently: true })!;

    const pdf = new jsPDF({
      unit: "mm",
      format: "a4",
      orientation: "portrait",
    });
    const page = document.createElement("canvas");
    const ctx = page.getContext("2d")!;
    page.width = canvas.width;

    for (let i = 0, top = 0; top < canvas.height; i++) {
      // The last page runs to the end of the capture: the trailing margin the
      // scale accounts for lands past the final break, and it is blank anyway.
      const wanted =
        i + 2 < pageBreaks.length
          ? Math.round(pageBreaks[i + 1] * scale)
          : canvas.height;
      let bottom = Math.min(wanted, top + maxRows, canvas.height);
      // What the rounding above cannot absorb, the capture itself can answer:
      // back the cut onto a row the raster says is clear.
      if (bottom < canvas.height)
        bottom = clearCutRow(source, canvas, bottom, top);
      if (bottom <= top) bottom = Math.min(top + maxRows, canvas.height);

      // Assigning the height also clears the canvas, hence the refill.
      page.height = bottom - top;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, page.width, page.height);
      ctx.drawImage(
        canvas,
        0,
        top,
        page.width,
        page.height,
        0,
        0,
        page.width,
        page.height
      );

      if (i) pdf.addPage();
      pdf.addImage(
        page.toDataURL("image/jpeg", 0.96),
        "JPEG",
        PAGE_MM.marginX,
        PAGE_MM.marginY,
        CONTENT_MM.width,
        page.height / scale / MM_TO_PX
      );
      top = bottom;
    }

    pdf.save(pdfFilename());
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
