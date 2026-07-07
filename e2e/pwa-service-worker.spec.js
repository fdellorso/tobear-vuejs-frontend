import { test, expect } from '@playwright/test'

const PWA_URL = 'http://localhost:4173/app'

/**
 * Naviga a / per caricare l'app e registrare il SW,
 * poi aspetta che il SW sia attivo e controlli la pagina.
 */
async function waitForSw(page) {
  await page.goto(PWA_URL + '/')
  await page.waitForLoadState('networkidle')
  // Il SW viene registrato dopo l'evento load
  await page.waitForFunction(async () => {
    if (!('serviceWorker' in navigator)) return true
    const reg = await navigator.serviceWorker.getRegistration()
    if (!reg) return false
    // Attendi che un active worker controlli la pagina
    if (!reg.active) return false
    // A volte serve anche aspettare che il SW abbia il controllo
    if (navigator.serviceWorker.controller === null) return false
    return true
  }, { timeout: 15000 })
}

test.describe('PWA Service Worker', () => {

  test('app loads and registers service worker', async ({ page }) => {
    await page.goto(PWA_URL + '/')
    await page.waitForLoadState('networkidle')

    const swRegistered = await page.evaluate(async () => {
      if (!('serviceWorker' in navigator)) return false
      const reg = await navigator.serviceWorker.getRegistration()
      return !!reg
    })
    expect(swRegistered).toBe(true)
  })

  test('app serves cached content when offline', async ({ page, context }) => {
    // Prima visita: registra SW e popola la cache
    await waitForSw(page)

    // Vai offline
    await context.setOffline(true)

    // Ricarica — il SW deve servire dalla cache
    await page.reload()
    await page.waitForLoadState('domcontentloaded')

    // L'app deve caricarsi dalla cache
    await expect(page.locator('#app')).toBeVisible({ timeout: 10000 })

    await context.setOffline(false)
  })

  test('guest can create task offline and it persists', async ({ page, context }) => {
    await waitForSw(page)

    // Naviga a /todo tramite SW (navigateFallback → index.html)
    await page.evaluate(() => window.location.href = '/app/todo')
    await page.waitForLoadState('networkidle')

    // Chiudi cookie banner se presente
    const rifiutaBtn = page.getByRole('button', { name: 'Rifiuta' })
    if (await rifiutaBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await rifiutaBtn.click()
      await page.waitForTimeout(300)
    }

    // Vai offline
    await context.setOffline(true)

    // Crea un task offline
    await page.waitForSelector('input[placeholder="Task title"]', { timeout: 10000 })
    const input = page.locator('input[placeholder="Task title"]')
    await input.fill('Task offline PWA')
    await input.press('Enter')

    await expect(page.locator('text=Task offline PWA')).toBeVisible({ timeout: 5000 })

    await context.setOffline(false)

    // Ricarica e verifica persistenza (IndexedDB)
    await page.reload()
    await page.waitForLoadState('networkidle')
    await expect(page.locator('text=Task offline PWA')).toBeVisible({ timeout: 5000 })
  })

  test('navigate fallback serves index.html for unknown routes', async ({ page }) => {
    await waitForSw(page)

    // Ora che il SW controlla la pagina, naviga a una route SPA
    await page.evaluate(() => window.location.href = '/app/todo')
    await page.waitForLoadState('domcontentloaded')

    await expect(page.locator('#app')).toBeVisible()
    const title = await page.title()
    expect(title).toBe('toBear')
  })

})
