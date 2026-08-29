import { defineConfig } from '@playwright/test';

const LOCAL_SERVER_PORT = 4173;

export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 30_000,
  use: {
    baseURL: `http://localhost:${LOCAL_SERVER_PORT}`,
    locale: 'ar',
  },
  webServer: {
    command: `npx --yes serve -l ${LOCAL_SERVER_PORT} .`,
    url: `http://localhost:${LOCAL_SERVER_PORT}`,
    reuseExistingServer: true,
  },
  projects: [{ name: 'chromium', use: { browserName: 'chromium' } }],
});
