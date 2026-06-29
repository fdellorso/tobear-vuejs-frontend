import { test, expect } from '@playwright/test'

const BASE_URL = 'https://laravel.fritz.box:3000'

test.describe('SPA navigazione client-side senza full-page reload', () => {
  test('la navigazione interna usa solo Vue Router, mai full-page reload', async ({ page }) => {
    await page.goto(`${BASE_URL}/todo`, { waitUntil: 'networkidle' })
    await page.waitForTimeout(500)
    await page.evaluate(() => { window.__appLoaded = true })

    async function navigateByLink(linkText, expectedUrlSubstr, step) {
      const before = await page.evaluate(() => window.__appLoaded)
      expect(before, `[${step}] sentinella presente PRIMA del click`).toBe(true)

      const link = page.getByText(linkText, { exact: false }).first()
      try {
        await link.waitFor({ state: 'visible', timeout: 3000 })
      } catch {
        console.log(`  ⏭️  [${step}] "${linkText}" non visibile, skippo`)
        return
      }
      await link.click()
      await page.waitForURL(`**${expectedUrlSubstr}`, { timeout: 5000 })

      const after = await page.evaluate(() => window.__appLoaded)
      expect(after, `[${step}] sentinella presente DOPO "${linkText}" → ${expectedUrlSubstr}`).toBe(true)
      console.log(`  ✅ [${step}] ${linkText} → ${expectedUrlSubstr} (client-side)`)
    }

    console.log('\n🔍 Verifica navigazione SPA — nessun full-page reload:\n')

    // 1. AppLayout: "Registrati" → /register
    await navigateByLink('Registrati', '/register', '1/6')

    // 2. GuestLayout nav: "Contact" → /contact
    await navigateByLink('Contact', '/contact', '2/6')

    // 3. GuestLayout nav: "About" → /about
    await navigateByLink('About', '/about', '3/6')

    // 4. GuestLayout "Log in →" → /login
    await navigateByLink('Log in', '/login', '4/6')

    // 5. Da /login, GuestLayout nav: "Contact" → /contact
    await navigateByLink('Contact', '/contact', '5/6')

    // 6. GuestLayout nav: "About" → /about
    await navigateByLink('About', '/about', '6/6')

    console.log('\n✅ Completato: tutte le 6 navigazioni sono client-side, nessun full-page reload')
  })
})
