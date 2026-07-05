import { test, expect } from '@playwright/test'

test.describe('SPA navigazione client-side senza full-page reload', () => {
  test('la navigazione via sidebar usa solo Vue Router, mai full-page reload', async ({ page }) => {
    await page.setViewportSize({ width: 1400, height: 900 })

    await page.goto('/todo', { waitUntil: 'networkidle' })
    await page.waitForTimeout(500)

    const cookieBanner = page.getByText('Usiamo Matomo')
    if (await cookieBanner.isVisible({ timeout: 1000 }).catch(() => false)) {
      await page.getByRole('button', { name: 'Rifiuta' }).click()
      await page.waitForTimeout(200)
    }

    await page.evaluate(() => { window.__appLoaded = true })

    async function navigateBySidebar(role, name) {
      const before = await page.evaluate(() => window.__appLoaded)
      expect(before, `Sentinella presente PRIMA del click su "${name}"`).toBe(true)

      const btn = page.locator('aside').getByRole(role, { name })
      await btn.waitFor({ state: 'visible', timeout: 3000 })
      await btn.click()
      await page.waitForTimeout(500)

      const after = await page.evaluate(() => window.__appLoaded)
      expect(after, `Nessun reload dopo click "${name}"`).toBe(true)
      console.log(`  ✅ ${name} (${role}) — client-side`)
    }

    console.log('\n🔍 Verifica navigazione SPA via sidebar (1400px):\n')

    await navigateBySidebar('button', 'About')
    await navigateBySidebar('button', 'Contact')
    await navigateBySidebar('link', 'Todo')

    console.log('\n✅ Completato: tutte le navigazioni sono client-side')
  })
})
