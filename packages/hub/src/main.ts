import "./style.css";

const tools = [
	{
		name: "Symbol Picker",
		icon: "shared/symbolpicker/logo.svg",
		href: "/symbolpicker/",
	},
];

function main() {
	const main = document.querySelector("main") as HTMLElement;
	main.innerHTML = tools
		.map(
			(tool) => `
        <a href="${tool.href}">
          <img src="${tool.icon}" alt="${tool.name}" />
          <span>${tool.name}</span>
        </a>
      `
		)
		.join("");
}

document.addEventListener("DOMContentLoaded", main);

