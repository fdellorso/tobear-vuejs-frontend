import { test, expect } from '@playwright/test'

const BASE_URL = 'https://laravel.fritz.box:3000'

test.describe('Task creation: Enter key without full-page reload', () => {
  test('pressing Enter on new task input creates the task client-side, no reload', async ({
    page,
  }) => {
    await page.goto(`${BASE_URL}/todo`, { waitUntil: 'networkidle' })
    await page.waitForTimeout(500)
    await page.evaluate(() => {
      window.__appLoaded = true
    })

    const input = page.getByPlaceholder('Titolo del task')
    await input.waitFor({ state: 'visible', timeout: 3000 })

    await input.fill('Task da Enter')
    await page.keyboard.press('Enter')
    await page.waitForTimeout(500)

    const sentinel = await page.evaluate(() => window.__appLoaded)
    expect(sentinel, 'Nessun full-page reload dopo Enter').toBe(true)

    const taskText = page.getByText('Task da Enter')
    await expect(taskText).toBeVisible({ timeout: 3000 })

    console.log('  ✅ Enter crea task senza full-page reload')
  })
})
