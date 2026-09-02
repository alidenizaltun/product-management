import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
    plugins: [react()],
    test: {
        environment: "jsdom",
        globals: true,
        setupFiles: ["./src/tests/setup.ts"],
        coverage: {
            provider: "v8",
            reporter: ["text", "html"],
            include: ["src/pages/products/**", "src/infrastructure/**"],
        },
    },
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "src"),
        },
    },
});
