import { EditorView, basicSetup } from "codemirror";
import { EditorState, Compartment, StateEffect, StateField } from "@codemirror/state";
import { Decoration, WidgetType, type DecorationSet } from "@codemirror/view";
import { oneDark } from "@codemirror/theme-one-dark";
import type { MatchResult, WorkerResponse } from "./regex-worker.ts";
import "../../shared/ads/ad-slot.css";
import "./main.css";

const defaultPattern = "(?<user>[\\w.+-]+)@(?<domain>[\\w-]+(?:\\.[\\w-]+)+)";
const defaultFlags = "g";
const defaultText = `Regex Tester highlights every match as you type.

Contact us at support@tarenx.com or sales@example.co.kr —
invalid ones like "user@" or "@domain.com" are skipped.

Try your own pattern above: flags, named groups like (?<user>...),
and capture groups all update live.`;

const MATCH_TIMEOUT_MS = 500;
const DEBOUNCE_MS = 150;

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

// ------------------------------------------------------------- decorations

class EmptyMatchWidget extends WidgetType {
  toDOM() {
    const span = document.createElement("span");
    span.className = "cm-match-empty";
    return span;
  }
}

const setHighlights = StateEffect.define<DecorationSet>();

const highlightField = StateField.define<DecorationSet>({
  create: () => Decoration.none,
  update(deco, tr) {
    for (const effect of tr.effects) {
      if (effect.is(setHighlights)) return effect.value;
    }
    return tr.docChanged ? deco.map(tr.changes) : deco;
  },
  provide: (field) => EditorView.decorations.from(field),
});

const markA = Decoration.mark({ class: "cm-match cm-match-a" });
const markB = Decoration.mark({ class: "cm-match cm-match-b" });
const markSelected = Decoration.mark({ class: "cm-match cm-match-selected" });
const emptyWidget = Decoration.widget({ widget: new EmptyMatchWidget() });

function buildDecorations(
  matches: MatchResult[],
  docLength: number,
  selected: number
): DecorationSet {
  const ranges = [];
  for (let i = 0; i < matches.length; i++) {
    const m = matches[i];
    if (m.start > docLength) break;
    const end = Math.min(m.end, docLength);
    if (m.start === end) {
      ranges.push(emptyWidget.range(m.start));
    } else {
      const mark = i === selected ? markSelected : i % 2 === 0 ? markA : markB;
      ranges.push(mark.range(m.start, end));
    }
  }
  return Decoration.set(ranges, true);
}

// ------------------------------------------------------------- worker

function createWorker(onResponse: (r: WorkerResponse) => void): Worker {
  const worker = new Worker(new URL("./regex-worker.ts", import.meta.url), {
    type: "module",
  });
  worker.onmessage = (e: MessageEvent<WorkerResponse>) => onResponse(e.data);
  return worker;
}

// ------------------------------------------------------------- app

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function main() {
  const patternInput = document.getElementById(
    "pattern-input"
  ) as HTMLInputElement;
  const flagButtons = Array.from(
    document.querySelectorAll<HTMLButtonElement>(".flag-btn")
  );
  const statusEl = document.getElementById("pattern-status")!;
  const matchList = document.getElementById("match-list")!;
  const matchCount = document.getElementById("match-count")!;
  const themeToggleBtn = document.getElementById("theme-toggle-btn")!;
  const editorParent = document.getElementById("editor")!;
  const replaceToggle = document.getElementById("replace-toggle")!;
  const replaceInput = document.getElementById(
    "replace-input"
  ) as HTMLInputElement;
  const resultPanel = document.getElementById("result-panel")!;
  const replaceOutput = document.getElementById("replace-output")!;
  const copyResultBtn = document.getElementById("copy-result-btn")!;

  patternInput.value = defaultPattern;
  for (const btn of flagButtons) {
    btn.classList.toggle("active", defaultFlags.includes(btn.dataset.flag!));
  }

  let currentMatches: MatchResult[] = [];
  let selectedIndex = -1;
  let replaceEnabled = false;
  let requestId = 0;
  let timeoutTimer: ReturnType<typeof setTimeout> | undefined;
  let debounceTimer: ReturnType<typeof setTimeout> | undefined;

  const editor = new EditorView({
    state: EditorState.create({
      doc: defaultText,
      extensions: [
        basicSetup,
        highlightField,
        EditorView.lineWrapping,
        themeCompartment.of(isDarkMode ? oneDark : []),
        EditorView.theme({ "&": { height: "100%" } }),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) scheduleRun();
        }),
      ],
    }),
    parent: editorParent,
  });

  let worker = createWorker(onWorkerResponse);

  function activeFlags(): string {
    return flagButtons
      .filter((b) => b.classList.contains("active"))
      .map((b) => b.dataset.flag!)
      .join("");
  }

  function setStatus(message: string, kind: "ok" | "error" | "warn" | "idle") {
    statusEl.textContent = message;
    statusEl.className = `pattern-status ${kind}`;
  }

  function scheduleRun() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(run, DEBOUNCE_MS);
  }

  function run() {
    const source = patternInput.value;
    selectedIndex = -1;
    if (!source) {
      applyMatches([], false);
      setStatus("Enter a pattern to start matching.", "idle");
      return;
    }
    const id = ++requestId;
    worker.postMessage({
      id,
      source,
      flags: activeFlags(),
      text: editor.state.doc.toString(),
      replacement: replaceEnabled ? replaceInput.value : undefined,
    });
    clearTimeout(timeoutTimer);
    timeoutTimer = setTimeout(() => {
      // The worker is stuck (catastrophic backtracking) — kill and replace it.
      worker.terminate();
      worker = createWorker(onWorkerResponse);
      applyMatches([], false);
      setStatus(
        "Pattern took too long to run (possible catastrophic backtracking) and was stopped.",
        "error"
      );
    }, MATCH_TIMEOUT_MS);
  }

  function onWorkerResponse(response: WorkerResponse) {
    if (response.id !== requestId) return;
    clearTimeout(timeoutTimer);
    if (response.error) {
      applyMatches([], false);
      replaceOutput.textContent = "";
      setStatus(`Invalid pattern: ${response.error}`, "error");
      return;
    }
    replaceOutput.textContent = response.replaced ?? "";
    const matches = response.matches ?? [];
    applyMatches(matches, response.truncated ?? false);
    const flags = activeFlags();
    if (matches.length === 0) {
      setStatus("No matches.", "idle");
    } else if (response.truncated) {
      setStatus(
        `Showing first ${matches.length} matches (list truncated).`,
        "warn"
      );
    } else {
      const single =
        !flags.includes("g") && !flags.includes("y")
          ? " — add the g flag to find every match"
          : "";
      setStatus(
        `${matches.length} match${matches.length === 1 ? "" : "es"}${single}`,
        "ok"
      );
    }
  }

  function applyMatches(matches: MatchResult[], truncated: boolean) {
    currentMatches = matches;
    editor.dispatch({
      effects: setHighlights.of(
        buildDecorations(matches, editor.state.doc.length, selectedIndex)
      ),
    });
    renderMatchList(truncated);
  }

  function renderMatchList(truncated: boolean) {
    matchCount.textContent = String(currentMatches.length);
    if (currentMatches.length === 0) {
      matchList.innerHTML = `<p class="match-list-empty">Matches will appear here.</p>`;
      return;
    }
    matchList.innerHTML =
      currentMatches
        .map((m, i) => {
          const groups = m.groups
            .map((g) => {
              const label = g.name ? `${g.index} · ${escapeHtml(g.name)}` : `${g.index}`;
              const value =
                g.text === null
                  ? `<em>no match</em>`
                  : `<code>${escapeHtml(g.text)}</code>`;
              return `<li><span class="group-label">${label}</span>${value}</li>`;
            })
            .join("");
          return `
            <button class="match-item${i === selectedIndex ? " selected" : ""}" data-index="${i}">
              <div class="match-item-head">
                <span class="match-item-index">#${i + 1}</span>
                <span class="match-item-range">${m.start}–${m.end}</span>
              </div>
              <code class="match-item-text">${m.text === "" ? "<em>empty match</em>" : escapeHtml(m.text)}</code>
              ${groups ? `<ul class="match-groups">${groups}</ul>` : ""}
            </button>`;
        })
        .join("") +
      (truncated
        ? `<p class="match-list-empty">List truncated at ${currentMatches.length} matches.</p>`
        : "");
  }

  matchList.addEventListener("click", (event) => {
    const item = (event.target as HTMLElement).closest<HTMLElement>(
      ".match-item"
    );
    if (!item) return;
    selectedIndex = Number(item.dataset.index);
    const m = currentMatches[selectedIndex];
    const docLength = editor.state.doc.length;
    editor.dispatch({
      effects: [
        setHighlights.of(
          buildDecorations(currentMatches, docLength, selectedIndex)
        ),
        EditorView.scrollIntoView(Math.min(m.start, docLength), {
          y: "center",
        }),
      ],
    });
    for (const el of matchList.querySelectorAll(".match-item.selected")) {
      el.classList.remove("selected");
    }
    item.classList.add("selected");
  });

  replaceToggle.addEventListener("click", () => {
    replaceEnabled = !replaceEnabled;
    replaceToggle.classList.toggle("open", replaceEnabled);
    replaceToggle.setAttribute("aria-expanded", String(replaceEnabled));
    replaceInput.classList.toggle("hidden", !replaceEnabled);
    resultPanel.classList.toggle("hidden", !replaceEnabled);
    if (replaceEnabled) {
      replaceInput.focus();
      resultPanel.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
    scheduleRun();
  });

  replaceInput.addEventListener("input", scheduleRun);

  copyResultBtn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(replaceOutput.textContent ?? "");
      const original = copyResultBtn.innerHTML;
      copyResultBtn.innerHTML = "Copied!";
      setTimeout(() => {
        copyResultBtn.innerHTML = original;
      }, 1500);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  });

  patternInput.addEventListener("input", scheduleRun);
  for (const btn of flagButtons) {
    btn.addEventListener("click", () => {
      btn.classList.toggle("active");
      scheduleRun();
    });
  }

  themeToggleBtn.addEventListener("click", () => {
    isDarkMode = !isDarkMode;
    applyTheme(isDarkMode);
    localStorage.setItem("theme", isDarkMode ? "dark" : "light");
    editor.dispatch({
      effects: themeCompartment.reconfigure(isDarkMode ? oneDark : []),
    });
  });

  run();
}

document.addEventListener("DOMContentLoaded", main);
