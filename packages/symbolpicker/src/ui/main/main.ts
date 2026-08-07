import "./main.scss";
import { unicodeRanges } from "../../unicode/constants";
import generatedData from "../../unicode/generated-data.json";
import type { UnicodeData, UnicodeEntry } from "../../unicode/types";
import { AeroToast } from "@taren250424/aero";

// JSON imports widen tuples to string[], so the tuple shape has to be restored.
const unicodeData = generatedData as unknown as UnicodeData;

export function init() {
  const navContainer = document.getElementById("nav-container")!;
  const unicodeContainer = document.getElementById("unicode-container")!;

  navContainer.addEventListener("click", (e) => {
    const item = e.target as HTMLElement;
    if (!item || !item.classList.contains("nav-item")) return;

    navContainer.querySelector(".active")?.classList.remove("active");
    item.classList.add("active");

    const key = item.dataset.key!;
    updateURL(key);
    renderUnicode(unicodeContainer, key);
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

    renderUnicode(unicodeContainer, newSelected);
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

  renderUnicode(unicodeContainer, getSelectedFromURL());
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

function renderUnicode(
  unicodeContainer: HTMLElement,
  key: keyof typeof unicodeRanges
) {
  unicodeContainer.innerHTML = (unicodeData[key] ?? []).map(toButton).join("");
}
