import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 60000,
  retries: 1,
  use: {
    headless: true,
    viewport: { width: 375, height: 812 },
  },
  projects: [
    {
      name: 'demo-app',
      use: {
        browserName: 'chromium',
        baseURL: 'http://localhost:8081',
      },
      testMatch: 'demo-app.spec.ts',
    },
    {
      name: 'bubble-shooter',
      use: {
        browserName: 'chromium',
        baseURL: 'http://localhost:8082',
      },
      testMatch: 'bubble-shooter.spec.ts',
    },
    {
      name: 'sudoku',
      use: {
        browserName: 'chromium',
        baseURL: 'http://localhost:8083',
      },
      testMatch: 'sudoku.spec.ts',
    },
  ],
  webServer: [
    {
      command: 'cd packages/app-template && CI=1 npx expo start --web --port 8081',
      port: 8081,
      timeout: 30000,
      reuseExistingServer: true,
    },
    {
      command: 'cd packages/app-bubble-shooter && CI=1 npx expo start --web --port 8082',
      port: 8082,
      timeout: 30000,
      reuseExistingServer: true,
    },
    {
      command: 'cd packages/app-sudoku && CI=1 npx expo start --web --port 8083',
      port: 8083,
      timeout: 30000,
      reuseExistingServer: true,
    },
  ],
});
