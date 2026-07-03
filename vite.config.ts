import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    plugins: [TanStackRouterVite(), react(), tailwindcss(), tsconfigPaths()],
    server: {
      proxy: {
        "/storage-proxy": {
          target: env.VITE_FIREBASE_STORAGE_URL || "https://firebasestorage.googleapis.com",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/storage-proxy/, ""),
        },
      },
    },
    build: {
      outDir: "dist",
    },
  };
});
