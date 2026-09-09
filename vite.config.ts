import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

const apiProxyTarget = process.env.VITE_API_PROXY_TARGET;

export default defineConfig({
  plugins: [react()],
  css: {
    devSourcemap: true,
  },
  server: apiProxyTarget
    ? {
        proxy: {
          "/api": {
            target: apiProxyTarget,
            changeOrigin: true,
            secure: false,
          },
        },
      }
    : undefined,
  resolve: {
    alias: [
      { find: "@", replacement: path.resolve(__dirname, "src") },
      { find: /^reactstrap$/, replacement: path.resolve(__dirname, "src/components/ui/reactstrap.tsx") },
    ],
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
});
