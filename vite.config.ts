import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [["babel-plugin-react-compiler"]],
      },
    }),
  ],
  worker: {
    format: "es",
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      input: {
        "background/worker": "./src/background/worker.ts",
        "content/ui": "./src/content/ui.tsx",
      },
      output: {
        entryFileNames: (chunk) => `${chunk.name}.js`,
        assetFileNames: (asset) => `assets/${asset.name ?? "[name].[ext]"}`,
      },
    },
  },
});
