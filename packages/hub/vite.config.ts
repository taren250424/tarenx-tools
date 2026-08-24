import fs from "fs";
import { defineConfig, normalizePath, type Plugin } from "vite";
import { viteStaticCopy } from "vite-plugin-static-copy";
import path from "path";

/**
 * Renders the tool list into the hub's HTML at build time so crawlers
 * see the internal links without executing JavaScript.
 */
function prerenderToolList(): Plugin {
  return {
    name: "prerender-tool-list",
    transformIndexHtml(html) {
      const packagesDir = path.resolve(__dirname, "..");
      const tools = fs
        .readdirSync(packagesDir, { withFileTypes: true })
        .filter(
          (entry) =>
            entry.isDirectory() &&
            entry.name !== "hub" &&
            entry.name !== "shared"
        )
        .map((entry) => {
          const source = fs.readFileSync(
            path.join(packagesDir, entry.name, "index.html"),
            "utf-8"
          );
          const title =
            source.match(/<title>(.*?)<\/title>/)?.[1] ?? entry.name;
          return { dir: entry.name, title };
        });

      const links = tools
        .map(
          ({ dir, title }) => `      <a href="/${dir}/">
        <img src="shared/${dir}/logo.svg" alt="${title}" />
        <span>${title}</span>
      </a>`
        )
        .join("\n");

      return html.replace("<main></main>", `<main>\n${links}\n    </main>`);
    },
  };
}

export default defineConfig({
  base: "/",
  plugins: [
    prerenderToolList(),
    viteStaticCopy({
      targets: [
        {
          src: normalizePath(path.resolve(__dirname, "../shared/")) + "/**/*",
          dest: "shared",
          rename: { stripBase: 1 },
        },
      ],
    }),
  ],
});
