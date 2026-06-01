import "./main.scss";
import { unicodeRanges } from "../../unicode/constants";
import { getUnicodes } from "../../unicode/utils";
import { AeroToast } from "@taren250424/aero";

export function init() {
	const navContainer = document.getElementById("nav-container")!;
	const unicodeContainer = document.getElementById("unicode-container")!;

	navContainer.addEventListener("click", (e) => {
		const item = e.target as HTMLElement;
		if (!item || !item.classList.contains("nav-item")) return;

		navContainer.querySelector(".active")?.classList.remove("active");
    item.classList.add("active");

		const key = item.dataset.key!
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
    navContainer.querySelector(`[data-key="${newSelected}"]`)?.classList.add("active");

		renderUnicode(unicodeContainer, newSelected);
	});

	const initialKey = getSelectedFromURL();
	Object.entries(unicodeRanges)
		.sort(([, a], [, b]) => a.label.localeCompare(b.label))
		.forEach(([key, value]) => {
		const div = document.createElement("div")
		div.dataset.key = key
		div.textContent = value.label
		div.classList.add("nav-item")
		if (key === initialKey) div.classList.add("active");
		navContainer.appendChild(div)
	});

	renderUnicode(unicodeContainer, getSelectedFromURL());
}

function getSelectedFromURL(): keyof typeof unicodeRanges {
	const params = new URLSearchParams(window.location.search);
	const value = params.get("unicode_type");
	if (value && value in unicodeRanges) return value as keyof typeof unicodeRanges;
	return "arrows";
}

function updateURL(value: string) {
	const url = new URL(window.location.href);
	url.searchParams.set("unicode_type", value);
	window.history.pushState({}, "", url.toString());
}

function renderUnicode(unicodeContainer: HTMLElement, key: keyof typeof unicodeRanges) {
  const unicodes = unicodeRanges[key].range.flatMap(([start, end]) => getUnicodes(start, end));

  unicodeContainer.innerHTML = unicodes
    .map(
      (item) =>
        `<button class="unicode-item" title="${item.code}" data-char="${item.char}">${item.char}</button>`
    )
    .join("");
}
