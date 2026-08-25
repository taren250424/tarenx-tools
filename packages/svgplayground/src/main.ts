import "../../shared/footer/site-footer.css";
import { EditorView, basicSetup } from "codemirror";
import { Compartment, EditorState } from "@codemirror/state";
import { html } from "@codemirror/lang-html";
import { oneDark } from "@codemirror/theme-one-dark";
import "../../shared/ads/ad-slot.css";
import "./main.css";

const defaultSVG = `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#00e676;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#00b0ff;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="200" height="200" rx="30" fill="url(#grad1)" />
  <circle cx="100" cy="100" r="40" fill="#1a1d27" />
  <path d="M 85 85 L 115 100 L 85 115 Z" fill="#e2e8f0" />
</svg>`;

const THEME_KEY = "svgplayground-theme";
const themeCompartment = new Compartment();

// The pre-paint script in index.html already resolved the theme and applied
// the class, so read it back rather than resolving it a second time here.
let isDarkMode = document.documentElement.classList.contains("dark");

function updateCanvas(canvas: HTMLElement, svgContent: string) {
  canvas.innerHTML = svgContent;
}

function downloadSVG(svgContent: string) {
  const blob = new Blob([svgContent], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "playground-export.svg";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function main() {
  const canvas = document.getElementById("canvas")!;
  const editorParent = document.getElementById("editor")!;
  const downloadBtn = document.getElementById("download-btn")!;
  const themeToggleBtn = document.getElementById("theme-toggle-btn")!;

  const state = EditorState.create({
    doc: defaultSVG,
    extensions: [
      basicSetup,
      html(),
      themeCompartment.of(isDarkMode ? oneDark : []),
      EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          updateCanvas(canvas, update.state.doc.toString());
        }
      }),
      EditorView.theme({
        "&": { height: "100%" },
      }),
    ],
  });

  const editor = new EditorView({
    state,
    parent: editorParent,
  });

  downloadBtn.addEventListener("click", () => {
    downloadSVG(editor.state.doc.toString());
  });

  themeToggleBtn.addEventListener("click", () => {
    isDarkMode = !isDarkMode;
    document.documentElement.classList.toggle("dark", isDarkMode);
    localStorage.setItem(THEME_KEY, isDarkMode ? "dark" : "light");
    editor.dispatch({
      effects: themeCompartment.reconfigure(isDarkMode ? oneDark : []),
    });
  });

  updateCanvas(canvas, defaultSVG);
}

document.addEventListener("DOMContentLoaded", main);
