import "./main.scss";
import { unicodeRanges } from "../../unicode/constants";
import generatedData from "../../unicode/generated-data.json";
import type { UnicodeData, UnicodeEntry } from "../../unicode/types";
import { AeroToast } from "@taren250424/aero";

// JSON imports widen tuples to string[], so the tuple shape has to be restored.
const unicodeData = generatedData as unknown as UnicodeData;

/** Every character, flattened once so search does not care about categories. */
const searchIndex = Object.values(unicodeData).flat();

/** Enough to scroll through; a bare "a" would otherwise render thousands. */
const MAX_RESULTS = 300;

export function init() {
  const navContainer = document.getElementById("nav-container")!;
  const unicodeContainer = document.getElementById("unicode-container")!;
  const searchInput = document.getElementById("search-input") as HTMLInputElement;
  const searchStatus = document.getElementById("search-status")!;

  const render = () => {
    const query = searchInput.value.trim();

    if (query === "") {
      searchStatus.textContent = "";
      renderEntries(unicodeContainer, unicodeData[getSelectedFromURL()] ?? []);
      return;
    }

    const matches = search(query);
    renderEntries(unicodeContainer, matches.slice(0, MAX_RESULTS));
    searchStatus.textContent = describe(matches.length, query);
  };

  searchInput.addEventListener("input", render);
  searchInput.addEventListener("keydown", (e) => {
    if (e.key !== "Escape" || searchInput.value === "") return;
    searchInput.value = "";
    render();
  });

  navContainer.addEventListener("click", (e) => {
    const item = e.target as HTMLElement;
    if (!item || !item.classList.contains("nav-item")) return;

    navContainer.querySelector(".active")?.classList.remove("active");
    item.classList.add("active");

    // Picking a category is a request to leave the search results.
    searchInput.value = "";
    updateURL(item.dataset.key!);
    render();
  });

  unicodeContainer.addEventListener("click", (e) => {
    const target = e.target as HTMLElement;
    if (target.classList.contains("unicode-item")) {
      const char = target.dataset.char;
      if (char) {
        navigator.clipboard.writeText(char);
        AeroToast.show("Copied!");
      }
    }
  });

  window.addEventListener("popstate", () => {
    const newSelected = getSelectedFromURL();

    navContainer.querySelector(".active")?.classList.remove("active");
    navContainer
      .querySelector(`[data-key="${newSelected}"]`)
      ?.classList.add("active");

    searchInput.value = "";
    render();
  });

  const initialKey = getSelectedFromURL();
  Object.entries(unicodeRanges)
    .sort(([, a], [, b]) => a.label.localeCompare(b.label))
    .forEach(([key, value]) => {
      const div = document.createElement("div");
      div.dataset.key = key;
      div.textContent = value.label;
      div.classList.add("nav-item");
      if (key === initialKey) div.classList.add("active");
      navContainer.appendChild(div);
    });

  render();
}

/**
 * Matches on Unicode name, on the Korean and English keywords in aliases.ts,
 * on a `2220` / `U+2220` code point, or on the character itself, ranked so
 * exact hits come before substring ones.
 */
function search(query: string): UnicodeEntry[] {
  const needle = query.toUpperCase();
  const keyword = query.toLowerCase();
  const hex = needle.replace(/^U\+/, "");
  const codePoint =
    /^U\+[0-9A-F]{2,6}$/.test(needle) || /^(?=[0-9A-F]{2,6}$)[A-F]*\d/.test(hex)
      ? parseInt(hex, 16)
      : null;

  const exact: UnicodeEntry[] = [];
  const prefix: UnicodeEntry[] = [];
  const substring: UnicodeEntry[] = [];

  for (const entry of searchIndex) {
    const [char, name, keywords] = entry;
    if (char === query || (codePoint !== null && char.codePointAt(0) === codePoint))
      exact.push(entry);
    else if (keywords?.includes(keyword)) exact.push(entry);
    else if (name.startsWith(needle)) prefix.push(entry);
    else if (keywords?.some((word) => word.startsWith(keyword))) prefix.push(entry);
    else if (name.includes(needle)) substring.push(entry);
    else if (keywords?.some((word) => word.includes(keyword))) substring.push(entry);
  }

  return [...exact, ...prefix, ...substring];
}

function describe(total: number, query: string) {
  if (total === 0) return `No symbol matches "${query}"`;
  const label = `${total} match${total === 1 ? "" : "es"} across all categories`;
  return total > MAX_RESULTS ? `${label} — showing first ${MAX_RESULTS}` : label;
}

function getSelectedFromURL(): keyof typeof unicodeRanges {
  const params = new URLSearchParams(window.location.search);
  const value = params.get("unicode_type");
  if (value && value in unicodeRanges)
    return value as keyof typeof unicodeRanges;
  return "arrows";
}

function updateURL(value: string) {
  const url = new URL(window.location.href);
  url.searchParams.set("unicode_type", value);
  window.history.pushState({}, "", url.toString());
}

const escapeHtml = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");

function toButton([char, name]: UnicodeEntry) {
  const code = "U+" + char.codePointAt(0)!.toString(16).toUpperCase();
  const title = escapeHtml(`${code} ${name}`);
  const value = escapeHtml(char);
  return `<button class="unicode-item" title="${title}" data-char="${value}">${value}</button>`;
}

function renderEntries(unicodeContainer: HTMLElement, entries: UnicodeEntry[]) {
  unicodeContainer.innerHTML = entries.map(toButton).join("");
}
