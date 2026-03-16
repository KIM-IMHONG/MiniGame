import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 60000,
  retries: 1,
  use: {
    headless: true,
    viewport: { width: 375, height: 812 },
    baseURL: 'http://localhost:3000',
  },
  webServer: {
    command: 'npx serve packages/app-template/dist -l 3000 -s',
    port: 3000,
    timeout: 10000,
    reuseExistingServer: true,
  },
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    },
  ],
});
