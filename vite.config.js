import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import path from "path";
import config from "./project.config.json";

// https://vitejs.dev/config/
export default defineConfig({
  base: "./",
  plugins: [svelte(), htmlPlugin()],
  build: {
    rollupOptions: {
      output: {
        dir: "dist",
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.name === "index") {
            return `assets/bundle.js`;
          }
          return `assets/[name].[hash].js`;
        },
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === "index.css") {
            return `assets/bundle.css`;
          }
          return "assets/[name]-[hash][extname]";
        },
      },
    },
  },
  resolve: {
    alias: {
      $assets: path.resolve("./src/assets"),
      $components: path.resolve("./src/components"),
      $lib: path.resolve("./src/lib"),
      $stores: path.resolve("./src/stores"),
      $utils: path.resolve("./src/utils"),
    },
  },
});

/**
 * Replace env variables in index.html
 * @see https://github.com/vitejs/vite/issues/3105#issuecomment-939703781
 * @see https://vitejs.dev/guide/api-plugin.html#transformindexhtml
 */
function htmlPlugin() {
  let config;
  return {
    name: "html-transform",
    configResolved(resolvedConfig) {
      config = resolvedConfig;
    },
    transformIndexHtml: {
      enforce: "pre",
      transform: (html) => {
        if (config?.define) {
          return html.replace(/{{(.*?)}}/g, (match, p1) => {
            if (config.define[p1]) {
              return JSON.parse(config.define[p1]);
            }
            return match;
          });
        }
      },
    },
  };
}
