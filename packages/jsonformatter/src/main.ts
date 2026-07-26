import { EditorView, basicSetup } from "codemirror";
import { EditorState, Compartment } from "@codemirror/state";
import { json } from "@codemirror/lang-json";
import { oneDark } from "@codemirror/theme-one-dark";
import yaml from "js-yaml";
import "./main.css";

const defaultJSON = `{
  "name": "JSON Formatter",
  "version": "1.0.0",
  "description": "A simple and beautiful JSON Formatter.",
  "features": [
    "Format / Beautify JSON",
    "Minify / Compress JSON",
    "Validate JSON with helpful error messages",
    "Convert JSON to YAML"
  ],
  "author": {
    "name": "Tarenx",
    "website": "https://tools.tarenx.com"
  }
}`;

const themeCompartment = new Compartment();

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

function setEditorText(editor: EditorView, text: string) {
  editor.dispatch({
    changes: { from: 0, to: editor.state.doc.length, insert: text },
  });
}

function showStatusBar(message: string, isError: boolean) {
  const statusBar = document.getElementById("status-bar")!;
  const statusMessage = document.getElementById("status-message")!;

  statusBar.className = "status-bar";
  if (isError) {
    statusBar.classList.add("error");
  } else {
    statusBar.classList.add("success");
  }
  statusMessage.textContent = message;
}

function hideStatusBar() {
  const statusBar = document.getElementById("status-bar")!;
  statusBar.className = "status-bar hidden";
}

function openYamlModal(
  modal: HTMLElement,
  outputText: HTMLElement,
  content: string
) {
  outputText.textContent = content;
  modal.classList.remove("hidden");
}

function closeYamlModal(modal: HTMLElement) {
  modal.classList.add("hidden");
}

async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error("Failed to copy text: ", err);
    return false;
  }
}

function main() {
  const editorParent = document.getElementById("editor")!;
  const formatBtn = document.getElementById("format-btn")!;
  const minifyBtn = document.getElementById("minify-btn")!;
  const yamlBtn = document.getElementById("yaml-btn")!;
  const validateBtn = document.getElementById("validate-btn")!;
  const themeToggleBtn = document.getElementById("theme-toggle-btn")!;

  const modal = document.getElementById("yaml-modal")!;
  const closeModalBtn = document.getElementById("close-modal-btn")!;
  const copyYamlBtn = document.getElementById("copy-yaml-btn")!;
  const yamlOutputText = document.getElementById("yaml-output-text")!;

  const state = EditorState.create({
    doc: defaultJSON,
    extensions: [
      basicSetup,
      json(),
      themeCompartment.of(isDarkMode ? oneDark : []),
      EditorView.theme({
        "&": { height: "100%" },
      }),
    ],
  });

  const editor = new EditorView({
    state,
    parent: editorParent,
  });

  // Toggle Theme
  themeToggleBtn.addEventListener("click", () => {
    isDarkMode = !isDarkMode;
    applyTheme(isDarkMode);
    localStorage.setItem("theme", isDarkMode ? "dark" : "light");
    editor.dispatch({
      effects: themeCompartment.reconfigure(isDarkMode ? oneDark : []),
    });
  });

  // Format JSON
  formatBtn.addEventListener("click", () => {
    const content = editor.state.doc.toString().trim();
    if (!content) {
      showStatusBar("Editor is empty.", true);
      return;
    }
    try {
      const obj = JSON.parse(content);
      const formatted = JSON.stringify(obj, null, 2);
      setEditorText(editor, formatted);
      showStatusBar("JSON formatted successfully.", false);
    } catch (err: any) {
      showStatusBar(`Format failed: ${err.message}`, true);
    }
  });

  // Minify JSON
  minifyBtn.addEventListener("click", () => {
    const content = editor.state.doc.toString().trim();
    if (!content) {
      showStatusBar("Editor is empty.", true);
      return;
    }
    try {
      const obj = JSON.parse(content);
      const minified = JSON.stringify(obj);
      setEditorText(editor, minified);
      showStatusBar("JSON minified successfully.", false);
    } catch (err: any) {
      showStatusBar(`Minify failed: ${err.message}`, true);
    }
  });

  // Convert to YAML
  yamlBtn.addEventListener("click", () => {
    const content = editor.state.doc.toString().trim();
    if (!content) {
      showStatusBar("Editor is empty.", true);
      return;
    }
    try {
      const obj = JSON.parse(content);
      const yamlStr = yaml.dump(obj);
      openYamlModal(modal, yamlOutputText, yamlStr);
      hideStatusBar();
    } catch (err: any) {
      showStatusBar(`Conversion to YAML failed: ${err.message}`, true);
    }
  });

  // Validate JSON
  validateBtn.addEventListener("click", () => {
    const content = editor.state.doc.toString().trim();
    if (!content) {
      showStatusBar("Editor is empty.", true);
      return;
    }
    try {
      JSON.parse(content);
      showStatusBar("Valid JSON! No errors found.", false);
    } catch (err: any) {
      showStatusBar(`Invalid JSON: ${err.message}`, true);
    }
  });

  // Modal logic
  closeModalBtn.addEventListener("click", () => closeYamlModal(modal));
  window.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeYamlModal(modal);
    }
  });

  // Copy YAML
  copyYamlBtn.addEventListener("click", async () => {
    const success = await copyToClipboard(yamlOutputText.textContent || "");
    if (success) {
      const originalText = copyYamlBtn.innerHTML;
      copyYamlBtn.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        Copied!
      `;
      setTimeout(() => {
        copyYamlBtn.innerHTML = originalText;
      }, 2000);
    }
  });
}

document.addEventListener("DOMContentLoaded", main);
