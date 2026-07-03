import { test, expect } from '@playwright/test'

test.describe('Auth + Sync flow', () => {

  test('guest can create tasks locally', async ({ page }) => {
    await page.goto('/todo')
    await page.waitForLoadState('networkidle')
    await page.waitForSelector('input[placeholder="Titolo del task"]', { timeout: 10000 })

    const input = page.locator('input[placeholder="Titolo del task"]')
    await input.fill('Task guest di test')
    await input.press('Enter')

    await expect(page.locator('text=Task guest di test')).toBeVisible({ timeout: 5000 })
  })

  test('login page is accessible and shows form', async ({ page }) => {
    await page.goto('/login')
    await page.waitForLoadState('networkidle')

    await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible({ timeout: 5000 })
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
  })

  test('register page is accessible', async ({ page }) => {
    await page.goto('/register')
    await page.waitForLoadState('networkidle')

    await expect(page.getByRole('heading', { name: 'Create account' })).toBeVisible({ timeout: 5000 })
    await expect(page.locator('input#reg-name')).toBeVisible()
    await expect(page.locator('input#reg-email')).toBeVisible()
    await expect(page.locator('input#reg-password')).toBeVisible()
  })

  test('guest mode persists tasks after reload', async ({ page }) => {
    await page.goto('/todo')
    await page.waitForLoadState('networkidle')
    await page.waitForSelector('input[placeholder="Titolo del task"]', { timeout: 10000 })

    const input = page.locator('input[placeholder="Titolo del task"]')
    await input.fill('Task persistente E2E')
    await input.press('Enter')
    await expect(page.locator('text=Task persistente E2E')).toBeVisible({ timeout: 5000 })

    await page.reload()
    await page.waitForLoadState('networkidle')
    await expect(page.locator('text=Task persistente E2E')).toBeVisible({ timeout: 5000 })
  })

  test('SPA navigation between todo and login does not reload page', async ({ page }) => {
    await page.goto('/todo')
    await page.waitForLoadState('networkidle')
    await page.evaluate(() => { window.__appLoaded = true })

    // Chiudi il cookie consent banner se presente
    const rifiutaBtn = page.getByRole('button', { name: 'Rifiuta' })
    if (await rifiutaBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await rifiutaBtn.click()
      await page.waitForTimeout(300)
    }

    // Naviga a /login via click sul link nella sidebar o FAB — non via page.goto
    // Usa il FAB su viewport mobile
    await page.setViewportSize({ width: 390, height: 844 })
    await page.locator('.fixed.bottom-6').click()
    await page.waitForTimeout(300)
    await page.getByRole('link', { name: 'Accedi' }).click()
    await page.waitForLoadState('networkidle')

    const appLoaded = await page.evaluate(() => window.__appLoaded)
    expect(appLoaded).toBe(true)
  })

})
