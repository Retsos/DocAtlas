import path from "path";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import cssInjectedByJsPlugin from "vite-plugin-css-injected-by-js"; 

export default defineConfig({
  plugins: [
    react(), 
    tailwindcss(),
    cssInjectedByJsPlugin(), 
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        entryFileNames: "widget.js",
        chunkFileNames: "widget.js",
        assetFileNames: "[name].[ext]"
      }
    }
  }
});