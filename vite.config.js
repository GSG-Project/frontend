import { copyFileSync } from "node:fs";
import { resolve } from "node:path";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

const DEFAULT_API_TARGET = "https://backend-jeo0.onrender.com";

// Static hosts answer unknown paths with 404.html. Making it a copy of the app lets a page
// opened or refreshed on a deep link (for example /compare) still start the app, and the
// router then shows the real page or the Not Found page.
function appAs404Page() {
  let outDir = "dist";
  return {
    name: "app-as-404-page",
    apply: "build",
    configResolved(config) {
      outDir = resolve(config.root, config.build.outDir);
    },
    closeBundle() {
      copyFileSync(resolve(outDir, "index.html"), resolve(outDir, "404.html"));
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const target = env.VITE_API_PROXY_TARGET || DEFAULT_API_TARGET;

  return {
    plugins: [react(), appAs404Page()],
    server: {
      proxy: {
        "/api": {
          target,
          changeOrigin: true,
          secure: target.startsWith("https://"),
        },
      },
    },
  };
});
