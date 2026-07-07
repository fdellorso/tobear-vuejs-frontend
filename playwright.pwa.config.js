/* global process */
import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  testMatch: '**/pwa-service-worker.spec.js',
  timeout: 60000,
  retries: 0,
  use: {
    baseURL: 'http://localhost:4173/app/',
    headless: true,
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
  },
  webServer: {
    command: process.env.CI ? 'npx vite preview --port 4173' : 'npm run build && npx vite preview --port 4173',
    url: 'http://localhost:4173/app/',
    reuseExistingServer: false,
    timeout: 60000,
  },
})
