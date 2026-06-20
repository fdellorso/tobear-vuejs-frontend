# Handoff — 2026-06-20 — E2E test e verifica PWA Service Worker

## Cosa è stato fatto

- **Installato `@playwright/test`** come devDependency, installato Chromium browser per Playwright.
- **Creato script E2E** `e2e-test.mjs` (non committato, tool usa-e-getta) che testa: navigazione, certificato/CORS, login Sanctum, caricamento task, SW registration.
- **Eseguito test E2E completo** su `npm run dev` (https://laravel.fritz.box:3000):
  - Step 1: pagina caricata, titolo "toBear", nessun errore certificato/mixed-content/CORS. Solo 401 atteso su `/api/user`.
  - Step 2: Service Worker **non registrato** in dev mode — comportamento atteso (vedi Decisioni).
  - Step 3: login funzionante — `GET /sanctum/csrf-cookie → 204`, `POST /api/login → 204`, `GET /api/user → 200`, redirect a `/todo`.
  - Step 4: `GET /api/v1/tasks → 200` (278ms).
- **Verificato SW in produzione**: `npm run build` → `npm run preview` su localhost:4173:
  - SW registrato e attivato (scope `/`, stato `activated`, controller attivo).
  - SW genera 5 entry precache + runtime caching per API (NetworkFirst) e risorse statiche (CacheFirst).
- **Identificate credenziali di test corrette**: `u1@test.com` / `password` (utente presente nel DB MariaDB). `test@example.com` non esiste — il seeder non è mai stato eseguito o è stato sovrascritto da test precedenti.
- **Scoperto** che il DB contiene 10 utenze, tra cui `fdellorso@hotmail.com` (id=1, password sconosciuta), `logintest@test.com`, `u1@test.com`, `u2@test.com`, ecc.

## Stato attuale

- **Frontend**: `.env.development` con URL HTTPS corretti, VitePWA decommentato e attivo (devOptions.enabled: false).
- **Login**: funzionante con credenziali `u1@test.com` / `password`.
- **API tasks**: risponde 200, dati caricati correttamente.
- **SW**: funzionante in produzione. In dev non si registra (scelta deliberata).
- **Niente è rotto** al momento.
- **Uncommitted changes** nel working tree: `.env.development` (http→https), `vite.config.js` (VitePWA decommentato + https server), `package.json`/`package-lock.json` (aggiunto @playwright/test), `e2e-test.mjs` (nuovo, non tracciato).

## Decisioni prese

- **`devOptions.enabled: false` in VitePWA è intenzionale e non va modificato**: vite-plugin-pwa disabilita il SW in dev per non interferire con HMR. Per testare il SW va sempre usato `npm run build` + preview. Confermato funzionante.
- **Test E2E con Playwright script standalone** invece che con `@playwright/test` runner: più flessibile per debugging rapido. Se si vuole integrazione CI, si può migrare.
- **Nessuna modifica a `devOptions.enabled` per "far funzionare" il test in dev**.

## Prossimi passi

1. **TODO.md voce "PWA service worker cache for offline and sync when online"**: non ancora completata — il SW si registra ma `offline.html` non esiste (`navigateFallback: '/offline.html'` in workbox). Servono:
   - Creare `offline.html` nella root del progetto (o `index.html` fallback funzionante).
   - Testare comportamento offline (disconnessione rete + navigazione).
   - Verificare sync offline dei task (pattern già implementato in `TodoPage.vue` con IndexedDB).
2. **TODO.md voce "Riabilitare PWA + HTTPS (mkcert) in vite.config.js"**: **COMPLETATA**. Il VitePWA plugin è attivo e HTTPS è abilitato. Rimuovere la riga da TODO.md.
3. **Commit delle modifiche in sospeso** (`.env.development`, `vite.config.js`, `package.json`): non sono state ancora committate. Decidere se farle rientrare in un commit specifico.
4. **Test E2E su componenti Vue** (TaskItem swipe, TodoPage offline pattern): sarebbe il prossimo passo logico ora che il flusso base è verificato.

## Note per il backend

Nessuna nuova richiesta API in questa sessione. Tutto funziona con gli endpoint esistenti.

## File rilevanti

- `vite.config.js` — VitePWA plugin attivo, `devOptions.enabled: false`, HTTPS server
- `.env.development` — `VITE_API_BASE_URL=https://laravel.fritz.box:8000/api`, `VITE_BASE_URL=https://laravel.fritz.box:3000`
- `package.json` — aggiunto `@playwright/test` devDependency
- `e2e-test.mjs` — script E2E Playwright (non committato)
- `handoffs/2026-06-20-introduzione-vitest-e-primi-test.md` — sessione precedente: test unitari Vitest per useTaskDB e userStore
