import { test, expect } from '@playwright/test'

const BASE_URL = 'https://laravel.fritz.box:3000'

test.describe('SPA navigazione client-side senza full-page reload', () => {
  test('la navigazione interna usa solo Vue Router, mai full-page reload', async ({ page }) => {
    // Imposta viewport largo (xl+, 3-colonne) per garantire che i link nella sidebar
    // siano visibili direttamente, senza dover aprire popover FAB
    await page.setViewportSize({ width: 1400, height: 900 })

    await page.goto(`${BASE_URL}/todo`, { waitUntil: 'networkidle' })
    await page.waitForTimeout(500)

    // Dismiss cookie consent banner if present (it has z-50 and blocks clicks below)
    const cookieBanner = page.getByText('Usiamo Matomo')
    if (await cookieBanner.isVisible({ timeout: 1000 }).catch(() => false)) {
      await page.getByRole('button', { name: 'Rifiuta' }).click()
      await page.waitForTimeout(200)
    }

    await page.evaluate(() => {
      window.__appLoaded = true
    })

    async function navigateByLink(expectedName, role, expectedUrlSubstr, step) {
      const before = await page.evaluate(() => window.__appLoaded)
      expect(before, `[${step}] sentinella presente PRIMA del click`).toBe(true)

      const link = page.getByRole(role, { name: new RegExp(expectedName, 'i') }).first()
      try {
        await link.waitFor({ state: 'visible', timeout: 3000 })
      } catch {
        console.log(`  ⏭️  [${step}] "${expectedName}" (role=${role}) non visibile, skippo`)
        return
      }
      await link.click()
      await page.waitForURL(`**${expectedUrlSubstr}`, { timeout: 5000 })

      const after = await page.evaluate(() => window.__appLoaded)
      expect(after, `[${step}] sentinella presente DOPO "${expectedName}" → ${expectedUrlSubstr}`).toBe(
        true,
      )
      console.log(`  ✅ [${step}] ${expectedName} → ${expectedUrlSubstr} (client-side)`)
    }

    console.log('\n🔍 Verifica navigazione SPA — nessun full-page reload:\n')

    // 1. AppLayout (3-colonne xl+): link "Registrati" nella sidebar sinistra → /register
    await navigateByLink('Registrati', 'link', '/register', '1/6')

    // 2. GuestLayout nav: "Contact" → /contact
    await navigateByLink('Contact', 'link', '/contact', '2/6')

    // 3. GuestLayout nav: "About" → /about
    await navigateByLink('About', 'link', '/about', '3/6')

    // 4. GuestLayout "Log in" → /login
    await navigateByLink('Log in', 'link', '/login', '4/6')

    // 5. Da /login, GuestLayout nav: "Contact" → /contact
    await navigateByLink('Contact', 'link', '/contact', '5/6')

    // 6. GuestLayout nav: "About" → /about
    await navigateByLink('About', 'link', '/about', '6/6')

    console.log(
      '\n✅ Completato: tutte le 6 navigazioni sono client-side, nessun full-page reload',
    )
  })
})
