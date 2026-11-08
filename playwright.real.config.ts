import { defineConfig, devices } from "@playwright/test";
export default defineConfig({ testDir: "./e2e-real", use: { baseURL: "http://127.0.0.1:4176", ...devices["Desktop Chrome"] } });
