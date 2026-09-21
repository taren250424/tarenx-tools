import { defineConfig, normalizePath } from "vite";
import { viteStaticCopy } from "vite-plugin-static-copy";
import path from "path";

export default defineConfig({
  base: "/calculator/",
  build: {
    license: { fileName: "licenses.txt" },
  },
  plugins: [
    viteStaticCopy({
      targets: [
        {
          src:
            normalizePath(path.resolve(__dirname, "../shared/calculator")) +
            "/**/*",
          dest: "shared",
          rename: { stripBase: 1 },
        },
      ],
    }),
  ],
});
