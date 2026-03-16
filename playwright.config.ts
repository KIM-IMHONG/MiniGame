import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 60000,
  retries: 1,
  use: {
    headless: true,
    viewport: { width: 375, height: 812 },
    baseURL: 'http://localhost:8081',
  },
  webServer: {
    command: 'cd packages/app-template && CI=1 npx expo start --web --port 8081',
    port: 8081,
    timeout: 30000,
    reuseExistingServer: true,
  },
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    },
  ],
});
