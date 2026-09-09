import { defineConfig, devices } from "@playwright/test";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: path.resolve(__dirname, ".env.test"), quiet: true });

// Backend'in CORS whitelist'i (appsettings.json: Cors:Client) sadece
// localhost:5173/5174'e izin veriyor - remote dev API'ye karşı test
// çalıştırmak için bu portlardan biri şart.
//
// Yazılabilir yerel koşularda (E2E_API_BASE_URL set, CI değil) 5173/5174
// çoğu zaman başka Vite süreçleri tarafından tutulur. O durumda 5176'da
// same-origin Vite proxy'si kullanılır; tarayıcı CORS'a takılmaz.
const writableApi = process.env.E2E_API_BASE_URL;
const useWritableProxy = Boolean(writableApi) && !process.env.CI;
const PORT = useWritableProxy ? 5176 : 5173;
const authFile = path.join(__dirname, "playwright/.auth/user.json");

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    // Yerel HTTPS API (https://localhost:7052) self-signed sertifika kullanır.
    ignoreHTTPSErrors: true,
  },
  expect: {
    toHaveScreenshot: { maxDiffPixelRatio: 0.02 },
  },
  projects: [
    { name: "setup", testMatch: /auth\.setup\.ts/ },
    {
      name: "public",
      testMatch: /e2e[\\/]public[\\/].*\.spec\.ts/,
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "authenticated",
      testMatch: /e2e[\\/]authenticated[\\/].*\.spec\.ts/,
      use: { ...devices["Desktop Chrome"], storageState: authFile },
      dependencies: ["setup"],
    },
  ],
  webServer: {
    command: `npx vite --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}`,
    // E2E_API_BASE_URL set edildiğinde mevcut Vite'ı yeniden kullanma: o süreç
    // .env'deki farklı bir API'ye bakıyor olabilir ve yazılabilir testler yanlış
    // veritabanına yazar.
    reuseExistingServer: !process.env.CI && !process.env.E2E_API_BASE_URL,
    timeout: 120_000,
    // Yerel .env'deki VITE_API_BASE_URL genelde localhost'taki (VS ile
    // ayağa kaldırılan) backend'e işaret ediyor; e2e testleri bu ortamda
    // çalışan bir yerel backend bulamıyor, bu yüzden sadece bu spawn için
    // paylaşımlı uzak dev API'sine yönlendiriyoruz. Tracked .env dosyası
    // değişmiyor. Faz 7 izole e2e CI job'u E2E_API_BASE_URL'i kendi ephemeral
    // API'sine (http://localhost:5080) ayarlayıp bu fallback'i geçersiz kılar.
    env: useWritableProxy
      ? {
          VITE_API_BASE_URL: `http://localhost:${PORT}/`,
          VITE_API_PROXY_TARGET: writableApi as string,
          NODE_TLS_REJECT_UNAUTHORIZED: "0",
        }
      : {
          VITE_API_BASE_URL: writableApi ?? "https://pmapi.deva.net.tr/",
        },
  },
});
