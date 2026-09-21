import { defineConfig, normalizePath } from "vite";
import { viteStaticCopy } from "vite-plugin-static-copy";
import path from "path";

export default defineConfig({
  base: "/svgplayground/",
  build: {
    license: { fileName: "licenses.txt" },
  },
  plugins: [
    viteStaticCopy({
      targets: [
        {
          src:
            normalizePath(path.resolve(__dirname, "../shared/svgplayground")) +
            "/**/*",
          dest: "shared",
          rename: { stripBase: 1 },
        },
      ],
    }),
  ],
});
