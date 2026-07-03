# Handoff — 2026-07-03 — Suite test E2E per PWA service worker

## Cosa è stato fatto

- Creato `e2e/pwa-service-worker.spec.js` con 4 test E2E per il service worker in produzione:
  1. **app loads and registers service worker** — naviga a `/`, verifica `navigator.serviceWorker.getRegistration()` restituisca un registro
  2. **app serves cached content when offline** — registra SW, va offline con `context.setOffline(true)`, ricarica, verifica `#app` visibile (servito da cache SW)
  3. **guest can create task offline and it persists** — registra SW, naviga a `/todo` via SW navigateFallback, va offline, crea task "Task offline PWA", torna online, ricarica, verifica persistenza IndexedDB
  4. **navigate fallback serves index.html for unknown routes** — registra SW, naviga a `/todo` via SW, verifica `#app` visibile e `<title>` === "toBear" (non 404)
- Build di produzione eseguita (`npm run build`) e servita con `npx serve dist -l 4173 &`
- Tutti e 4 i test passano (5.7s)

## Stato attuale

- **4 test E2E nuovi, tutti passanti** — testano il SW reale su build di produzione (non dev server)
- Il file `e2e/pwa-service-worker.spec.js` è **untracked** — non ancora committato
- `git status`: branch `main` ahead of `origin/main` by 2 commits, solo il nuovo file unstaged
- `serve` lasciato in esecuzione su `:4173` (build di produzione ancora attiva)
- Nessuna modifica a TODO.md

## Decisioni prese

- **I test PWA non possono usare `npm run test:e2e`** (che punta al dev server su `https://laravel.fritz.box:3000` con hot-reload). I test SW richiedono `npm run build` + static server. Vanno lanciati con `npx playwright test e2e/pwa-service-worker.spec.js --reporter=line` con `serve dist` in esecuzione su `:4173`.
- **Navigare direttamente a `/todo` su `serve` non funziona**: `serve` non ha SPA fallback, restituisce 404. Soluzione: prima navigare a `/` per caricare l'app e registrare il SW, aspettare che il SW sia attivo (`navigator.serviceWorker.controller !== null`), poi navigare a route SPA. Il SW con `NavigationRoute` + `createHandlerBoundToURL("/index.html")` intercetta la navigazione e serve l'app shell.
- **Helper `waitForSw(page)`**: funzione comune nei test che attende fino a che un active worker controlli la pagina (polling su `waitForFunction` con timeout 15s). Strumento riusabile per futuri test SW.
- **`window.location.href = '/todo'` per navigazione SPA dopo registrazione SW** — più diretto di `page.goto` perché innesca una navigazione within-scope controllata dal SW senza passare per `serve` (che restituirebbe 404).

## Prossimi passi

1. **Committare `e2e/pwa-service-worker.spec.js`** dopo approvazione.
2. **TODO.md #16** (UX desktop hover-reveal buttons) — ancora la priorità più alta non completata.
3. **TODO.md #18** (HomePage.vue) — decidere recupero o rimozione.
4. **Verificare perché i link nella sidebar (Registrati, Contact, About, Log in) non sono visibili nei test su viewport 1400×900** — segnalato in handoff precedente, ancora da investigare.
5. **Scrivere test Vitest per TaskItem.vue** (swipe, editing, long-press) — voce aperta da handoff precedenti.

## Note per il backend

- Nessuna richiesta di modifica API in questa sessione.

## File rilevanti

- `e2e/pwa-service-worker.spec.js` — nuova suite test E2E per service worker su build di produzione
- `vite.config.js` — config PWA (VitePWA plugin, workbox, runtimeCaching, navigateFallback)
- `public/manifest.webmanifest` — manifest PWA (tema, icone, shortcut, display standalone)
