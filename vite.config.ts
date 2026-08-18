import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  server:{
    port:5173,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
      "@app": path.resolve(__dirname, "./app"),
      "@components": path.resolve(__dirname, "./components"),
      "@lib": path.resolve(__dirname, "./lib"),
    },
  },
});
