import { chromium } from 'playwright-core';

// Usa l'URL della preview build, non del dev server
const BASE_URL = 'https://localhost:4173';
const API_BASE = 'https://laravel.fritz.box:8000';

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function run() {
  const browser = await chromium.launch({
    headless: true,
    executablePath: '/home/laravel/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome',
    args: ['--no-sandbox', '--ignore-certificate-errors'],
  });

  const context = await browser.newContext({
    ignoreHTTPSErrors: true,
    viewport: { width: 1280, height: 800 },
  });

  const page = await context.newPage();
  const issues = [];

  page.on('console', msg => {
    if (msg.type() === 'error')
      issues.push({ type: 'console', text: msg.text() });
  });
  page.on('pageerror', err =>
    issues.push({ type: 'pageerror', text: err.message })
  );
  page.on('requestfailed', request =>
    issues.push({ type: 'requestfailed', url: request.url(), error: request.failure()?.errorText })
  );

  process.stdout.write('=== Navigazione a ' + BASE_URL + ' ===\n');
  await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 30000 });
  await sleep(3000);

  process.stdout.write('URL: ' + page.url() + '\n');
  process.stdout.write('Titolo: "' + await page.title() + '"\n');

  // Check SW
  process.stdout.write('\n=== Service Worker ===\n');
  try {
    const regs = await page.evaluate(async () => {
      const r = await navigator.serviceWorker.getRegistrations();
      return r.map(reg => ({
        scope: reg.scope,
        active: reg.active?.state,
        installing: reg.installing?.state,
        waiting: reg.waiting?.state,
      }));
    });
    if (regs.length > 0) {
      process.stdout.write('✓ SW registrato (' + regs.length + '):\n');
      for (const reg of regs)
        process.stdout.write('  scope: ' + reg.scope + ' stato: ' + reg.active + '\n');
    } else {
      process.stdout.write('✗ NESSUN SW registrato\n');
    }
  } catch (e) {
    process.stdout.write('✗ Errore: ' + e.message + '\n');
  }

  // Check online/offline behavior
  try {
    const isControlled = await page.evaluate(() => navigator.serviceWorker.controller !== null);
    process.stdout.write('SW controller: ' + (isControlled ? '✓ attivo' : '✗ non controlla la pagina') + '\n');
  } catch (e) {
    process.stdout.write('Errore controller: ' + e.message + '\n');
  }

  // Login
  process.stdout.write('\n=== Login ===\n');
  await page.goto(BASE_URL + '/login', { waitUntil: 'networkidle' });
  await sleep(1000);

  const emailInput = await page.$('input[type="email"], input[name="email"]');
  const passwordInput = await page.$('input[type="password"]');
  if (emailInput && passwordInput) {
    await emailInput.fill('u1@test.com');
    await passwordInput.fill('password');
    const submitBtn = await page.$('button[type="submit"]');
    if (submitBtn) await submitBtn.click();
    else await passwordInput.press('Enter');
    await sleep(5000);
    process.stdout.write('Post-login URL: ' + page.url() + '\n');
    if (page.url().includes('/todo'))
      process.stdout.write('✓ Login OK\n');
    else
      process.stdout.write('✗ Login fallito\n');
  }

  // Issues summary
  process.stdout.write('\n=== ISSUES ===\n');
  if (issues.length === 0) {
    process.stdout.write('Nessun problema rilevato.\n');
  } else {
    for (const i of issues)
      process.stdout.write(JSON.stringify(i) + '\n');
  }

  await browser.close();
}

run().catch(e => {
  process.stderr.write('FATAL: ' + e.message + '\n');
  process.exit(1);
});
