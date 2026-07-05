import { test, expect } from '@playwright/test'

const BACKEND_URL = 'https://laravel.fritz.box:8000'
const TEST_CLEANUP_TOKEN = 'tobear-test-cleanup-2024'
const TEST_EMAIL = 'test@example.com'
const TEST_PASSWORD = 'password'

async function cleanupTestUser(request) {
  await request.post(`${BACKEND_URL}/api/test/cleanup`, {
    headers: { 'X-Test-Token': TEST_CLEANUP_TOKEN },
    data: { email: TEST_EMAIL },
  })
}

test.describe('Guest → Authenticated migration', () => {

  test.beforeEach(async ({ page, request }) => {
    // Pulisci task backend dell'utente di test
    await cleanupTestUser(request)

    // Pulisci frontend (localStorage, IndexedDB, cookie)
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.evaluate(async () => {
      localStorage.clear()
      const dbs = await indexedDB.databases()
      for (const db of dbs) {
        indexedDB.deleteDatabase(db.name)
      }
    })
    await page.context().clearCookies()
    await page.reload()
    await page.waitForLoadState('networkidle')
  })

  test('guest tasks migrate to account after login', async ({ page }) => {
    // 1. Vai su /todo come guest
    await page.goto('/todo')
    await page.waitForLoadState('networkidle')

    // Chiudi cookie banner se presente
    const rifiutaBtn = page.getByRole('button', { name: 'Rifiuta' })
    if (await rifiutaBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await rifiutaBtn.click()
      await page.waitForTimeout(300)
    }

    // 2. Crea 2 task come guest
    await page.waitForSelector('input[placeholder="Task title"]', { timeout: 10000 })
    const input = page.locator('input[placeholder="Task title"]')

    await input.fill('Task migrazione 1')
    await input.press('Enter')
    await expect(page.locator('text=Task migrazione 1')).toBeVisible({ timeout: 5000 })

    await input.fill('Task migrazione 2')
    await input.press('Enter')
    await expect(page.locator('text=Task migrazione 2')).toBeVisible({ timeout: 5000 })

    // 3. Vai su /login
    await page.goto('/login')
    await page.waitForLoadState('networkidle')

    // 4. Esegui login
    await page.fill('input[type="email"]', TEST_EMAIL)
    await page.fill('input[type="password"]', TEST_PASSWORD)
    await page.locator('form').getByRole('button', { name: 'Sign in' }).click()

    // 5. Aspetta redirect a /todo
    await page.waitForURL('**/todo', { timeout: 10000 })
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000) // tempo per migrateGuestTasks

    // 6. Verifica che i task guest siano visibili dopo il login
    await expect(page.locator('text=Task migrazione 1')).toBeVisible({ timeout: 10000 })
    await expect(page.locator('text=Task migrazione 2')).toBeVisible({ timeout: 10000 })
  })

  test('migration is idempotent (no duplicates on second call)', async ({ page }) => {
    // 1. Crea task guest
    await page.goto('/todo')
    await page.waitForLoadState('networkidle')

    const rifiutaBtn = page.getByRole('button', { name: 'Rifiuta' })
    if (await rifiutaBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await rifiutaBtn.click()
      await page.waitForTimeout(300)
    }

    await page.waitForSelector('input[placeholder="Task title"]', { timeout: 10000 })
    const input = page.locator('input[placeholder="Task title"]')
    await input.fill('Task idempotenza')
    await input.press('Enter')
    await expect(page.locator('text=Task idempotenza')).toBeVisible({ timeout: 5000 })

    // 2. Login
    await page.goto('/login')
    await page.waitForLoadState('networkidle')
    await page.fill('input[type="email"]', TEST_EMAIL)
    await page.fill('input[type="password"]', TEST_PASSWORD)
    await page.locator('form').getByRole('button', { name: 'Sign in' }).click()
    await page.waitForURL('**/todo', { timeout: 10000 })
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    // 3. Reload — triggera syncLocalTasks ma non deve duplicare
    await page.reload()
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    // 4. Conta le occorrenze del task — deve essere esattamente 1
    const taskCount = await page.locator('text=Task idempotenza').count()
    expect(taskCount).toBe(1)
  })

  test('logout clears session and returns to guest mode', async ({ page }) => {
    // 1. Login diretto
    await page.goto('/login')
    await page.waitForLoadState('networkidle')
    await page.fill('input[type="email"]', TEST_EMAIL)
    await page.fill('input[type="password"]', TEST_PASSWORD)
    await page.locator('form').getByRole('button', { name: 'Sign in' }).click()
    await page.waitForURL('**/todo', { timeout: 10000 })
    await page.waitForLoadState('networkidle')

    // 2. Logout via API (il click UI sul bottone Esci non innesca Vue, si bypassa)
    await page.evaluate(async () => {
      const base = 'https://laravel.fritz.box:8000'
      await fetch(base + '/sanctum/csrf-cookie', { credentials: 'include' })
      const xsrf = document.cookie.split('; ').find(r => r.startsWith('XSRF-TOKEN='))
      const token = xsrf ? decodeURIComponent(xsrf.split('=')[1]) : ''
      await fetch(base + '/api/logout', {
        method: 'POST',
        credentials: 'include',
        headers: { 'X-XSRF-TOKEN': token, 'Content-Type': 'application/json' },
      })
    })
    await page.waitForLoadState('networkidle')
    await page.evaluate(() => localStorage.removeItem('tobear_mode'))

    // 3. Verifica che siamo tornati in modalità guest
    await page.goto('/todo')
    await page.waitForLoadState('networkidle')

    await expect(page.getByRole('button', { name: 'Sign in' }).first()).toBeVisible({ timeout: 5000 })
  })

})
