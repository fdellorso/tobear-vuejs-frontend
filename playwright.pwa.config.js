/* global process */
import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  testMatch: '**/pwa-service-worker.spec.js',
  timeout: 60000,
  retries: 0,
  use: {
    baseURL: 'http://localhost:4173',
    headless: true,
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
  },
  webServer: {
    command: process.env.CI ? 'npx serve dist -l 4173' : 'npm run build && npx serve dist -l 4173',
    url: 'http://localhost:4173',
    reuseExistingServer: false,
    timeout: 60000,
  },
})
