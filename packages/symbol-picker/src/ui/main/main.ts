import "./main.scss";
import { ranges } from "../../unicode/constants";
import { getUnicodes } from "../../unicode/utils";
import { AeroToast } from "@taren250424/aero";

export function init() {
	const navContainer = document.getElementById("nav-container")!;
	const unicodeContainer = document.getElementById("unicode-container")!;

	navContainer.addEventListener("click", (e) => {
		const item = e.target as HTMLElement;
		if (!item || !item.classList.contains("nav-item")) return;

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
		renderUnicode(unicodeContainer, newSelected);
	});

	Object.keys(ranges).map((key) => {
		const div = document.createElement("div")
		div.dataset.key = key
		div.textContent = key
		div.classList.add("nav-item")
		navContainer.appendChild(div)
	});

	renderUnicode(unicodeContainer, getSelectedFromURL());
}

function getSelectedFromURL(): keyof typeof ranges {
	const params = new URLSearchParams(window.location.search);
	const value = params.get("unicode_type");
	if (value && value in ranges) return value as keyof typeof ranges;
	return "arrows";
}

function updateURL(value: string) {
	const url = new URL(window.location.href);
	url.searchParams.set("unicode_type", value);
	window.history.pushState({}, "", url.toString());
}

function renderUnicode(unicodeContainer: HTMLElement, key: keyof typeof ranges) {
	const unicodes = getUnicodes(...ranges[key]);

	unicodeContainer.innerHTML = unicodes
		.map(
			(item) =>
				`<button class="unicode-item" title="${item.code}" data-char="${item.char}">${item.char}</button>`
		)
		.join("");
}
