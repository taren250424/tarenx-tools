import "./style.css";

const htmlFiles = import.meta.glob("../../*/index.html", {
  eager: true,
  query: "?raw",
  import: "default",
}) as Record<string, string>;

const tools = Object.entries(htmlFiles)
  .map(([path, content]) => {
    // Vite resolves hub's index.html as '../index.html', others as '../../app/index.html'
    const parts = path.split("/");
    const folderName = parts[parts.length - 2];
    const dirName = folderName === ".." ? "hub" : folderName;

    // extract title from HTML content
    const titleMatch = content.match(/<title>(.*?)<\/title>/);
    const name = titleMatch ? titleMatch[1] : dirName;

    return {
      name,
      icon: `shared/${dirName}/logo.svg`,
      href: `/${dirName}/`,
    };
  })
  .filter((tool) => {
    const dirName = tool.href.replace(/\//g, "");
    return dirName !== "hub" && dirName !== "shared";
  });

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
