import { loadEnv } from "vite";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  // DEV_API_TARGET is read here (Node), so it does NOT need the VITE_ prefix
  // and is never shipped to the browser.
  const env = loadEnv(mode, process.cwd(), "");

  // In development the browser talks to "/api" on the Vite server, and Vite
  // forwards it to the backend. Same origin => no CORS, cookies just work.
  const proxy = {
    "/api": {
      target: env.DEV_API_TARGET || "http://localhost:8000",
      changeOrigin: true,
    },
  };

  return {
    plugins: [react()],
    server: { port: 5173, proxy },
    preview: { port: 4173, proxy }, // lets you test the production build locally too
    test: {
      environment: "jsdom",
      setupFiles: "./src/test/setup.js",
      css: false,
    },
  };
});
