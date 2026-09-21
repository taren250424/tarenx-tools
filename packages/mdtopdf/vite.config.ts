import { defineConfig, normalizePath } from "vite";
import { viteStaticCopy } from "vite-plugin-static-copy";
import path from "path";

export default defineConfig({
  base: "/mdtopdf/",
  build: {
    license: { fileName: "licenses.txt" },
  },
  plugins: [
    viteStaticCopy({
      targets: [
        {
          src:
            normalizePath(path.resolve(__dirname, "../shared/mdtopdf")) +
            "/**/*",
          dest: "shared",
          rename: { stripBase: 1 },
        },
      ],
    }),
  ],
});
