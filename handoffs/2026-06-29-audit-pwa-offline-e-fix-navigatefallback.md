# Handoff — 2026-06-29 — Audit PWA offline cache e fix navigateFallback + manifest

## Cosa è stato fatto

### Audit completo della copertura offline PWA
- Esaminata configurazione `VitePWA` in `vite.config.js` (workbox, runtimeCaching, navigateFallback, manifest esterno).
- Decodificato il Service Worker generato in `dist/sw.js`: precache di 5 entries, `NavigationRoute` con `createHandlerBoundToURL`, due runtime cache (API NetworkFirst 10s timeout + statici CacheFirst 30gg).
- Testato con Playwright la navigazione offline in 4 scenari: online /todo diretto, offline / con cache, offline /todo diretto, fresh browser offline.

### Bug critico scoperto e fixato: `navigateFallback` errato
- **File**: `vite.config.js:33`
- **Problema**: `navigateFallback: '/offline.html'` generava un `NavigationRoute(createHandlerBoundToURL("/offline.html"))` nel SW, che serviva la pagina "Sei offline" per **tutte** le navigazioni a route SPA (`/todo`, `/login`, ecc.) — anche quando l'utente era online.
- **Fix**: `navigateFallback: '/offline.html'` → `'/index.html'`. Il NavigationRoute ora serve l'app shell `index.html` dal precache, permettendo a Vue Router di caricare e gestire il routing client-side. I task vengono caricati da IndexedDB quando offline.
- **Verifica**: test Playwright ripetuto dopo il fix — tutti e 4 gli scenari passano (vedi sotto).

### Pulizia `public/manifest.webmanifest`
- `start_url` e `scope`: da hardcoded `https://laravel.fritz.box:3000` a path relativi `"/"`.
- Rimosso `prefer_related_applications: true` + `related_applications` (puntava a `com.example.app1` placeholder sul Play Store — pericoloso, tentava redirect).
- Rimossi scaffolding inutilizzati: `protocol_handlers`, `share_target`, `file_handlers`, `screenshots`, `iarc_rating_id`, `edge_side_panel`, `handle_links`, `scope_extensions`.
- `lang`: `"en"` → `"it"`.
- Mantenuti: `shortcuts`, `categories`, `display_override`, `launch_handler`, tutte le icone.

### Fix `apple-touch-icon` in `index.html`
- **File**: `index.html:18`
- **Problema**: puntava a `/img/icons/.png` (nome file vuoto — probabile bug di generazione).
- **Fix**: `/img/icons/.png` → `/img/icons/icon-180x180.png` (file reale, 31 KB, presente nella directory).

### Rimozione `<link rel="canonical">` (poi re-inserito con placeholder)
- Inizialmente rimosso perché hardcoded a `http://laravel.fritz.box:3000` (stesso problema di start_url/scope).
- Su richiesta dell'utente, re-inserito con `href="%VITE_BASE_URL%"` — Vite sostituisce il placeholder in build con il valore da `.env.production` (`/app`). Il canonical sarà relativo finché non verrà configurato un dominio pubblico reale in `.env.production`.

### Rimozione `public/offline.html`
- **File**: `public/offline.html` eliminato.
- **Motivo**: dopo il fix di `navigateFallback`, non veniva più usato da Workbox. Il NavigationRoute ora serve `index.html` per tutte le navigazioni. Il caso "fresh browser offline" non è risolvibile da un file precachato (nessun SW installato). L'app gestisce già il caso "nessun dato" con "Nessun task trovato.".
- **Impatto**: precache ridotto da 5 a 4 entries.

## Stato attuale

- **Precache**: 4 entries (JS, CSS, index.html, registerSW.js) — ~723 KB totali.
- **Runtime cache**: API (NetworkFirst, 10s timeout, 24h TTL) + statici (CacheFirst, 30gg TTL).
- **NavigationRoute**: serve `/index.html` per tutte le navigazioni SPA.
- **IndexedDB**: invariato — `useTaskDB.js` con pattern offline-first già funzionante (fetch da rete → salva in IDB → fallback a IDB se rete assente).
- **Sync offline**: `TodoPage.vue` — listener `online` event + sync di `localOnly`, `pendingComplete`, `pendingDelete`, `pendingReorder` — tutto invariato, già funzionante.

### Risultati test Playwright (dopo i fix)

| Scenario | Risultato |
|---|---|
| Test 1: Online /todo diretto | ✓ App caricata (non più "Sei offline") |
| Test 2: Offline / (cache popolata) | ✓ App caricata da IndexedDB |
| Test 3: Offline /todo diretto (cache popolata) | ✓ App caricata da IndexedDB |
| Test 4: Fresh browser offline (nessuna cache) | ✓ `ERR_INTERNET_DISCONNECTED` — limite PWA noto |

### Test Vitest
- Non eseguiti in questa sessione. Ultimo risultato noto: 34/34 passati (da handoff 2026-06-28).

### Lint
- Non eseguito in questa sessione. Ultimo risultato noto: 46 errori pre-esistenti (markdown lint su AGENTS.md/TODO.md + PaginationElement unused var) — nessuno nuovo introdotto.

## Decisioni prese

- **`navigateFallback: '/index.html'`** è la configurazione corretta per una SPA. `NavigationRoute` serve l'app shell per tutte le route non precachate, anche offline. Il pattern standard PWA per SPA è `navigateFallback: '/index.html'` (o il nome del file HTML principale), non un file offline separato.
- **`manifest: false` in VitePWA** è intenzionale e corretto: si usa `public/manifest.webmanifest` statico. VitePWA non genera il manifest ma gestisce comunque SW e precache.
- **Rimozione di `prefer_related_applications`**: pericoloso perché su Android tenta di reindirizzare al Play Store al posto della PWA. Doveva essere rimosso da subito.
- **Canonical link con `%VITE_BASE_URL%`**: scelta pragmatica — funziona automaticamente su qualunque dominio impostato in `.env.{mode}`. Il canonical rimarrà incompleto (path relativo) finché non verrà configurato un dominio assoluto in `.env.production`, ma non è bloccante.
- **`.env.production`** contiene `VITE_BASE_URL=/app` e `VITE_API_BASE_URL=/api` — valori di scaffolding/test, non ancora configurati per il dominio pubblico reale. Da aggiornare al momento del deploy.

## Prossimi passi (in ordine di priorità)

1. **Scrivere test Vitest per TaskItem.vue** (swipe, tap, editing, long-press) — voce aperta da handoff 2026-06-21, ancora non fatta.
2. **UX Desktop — hover-reveal buttons** per complete/delete (TODO.md riga 15-16) — sostituisce lo swipe mouse rimosso.
3. **ProfileIcon.vue** (TODO.md riga 22) — distinguere guest da authenticated.
4. **Commit modifiche in sospeso**: 4 file da committare (`index.html`, `vite.config.js`, `public/manifest.webmanifest`, `public/offline.html` rimosso).
5. **Sync offline batch**: endpoint `POST /v1/tasks/batch-import` per importare task guest con stato completed/deleted in blocco (da handoff precedenti).
6. **Configurare `.env.production`** con dominio reale prima del deploy pubblico.
7. **Pulire i 46 errori lint pre-esistenti** (markdown lint + unused var).

## Note per il backend

- **Nessuna nuova richiesta API in questa sessione**. I fix sono tutti lato frontend (vite config, manifest PWA, HTML).
- Da handoff precedenti: serve ancora `POST /v1/tasks/batch-import` per migrazione task guest.

## File rilevanti

- `vite.config.js` — `navigateFallback` corretto da `/offline.html` a `/index.html`
- `public/manifest.webmanifest` — pulito da scaffolding, path relativi, lang it
- `public/offline.html` — rimosso (non più utilizzato)
- `index.html` — `apple-touch-icon` corretto, canonical con `%VITE_BASE_URL%`
- `dist/sw.js` — SW generato (4 entries precache, NavigationRoute → index.html)
- `dist/index.html` — output build con `%VITE_BASE_URL%` risolto
- `src/pages/TodoPage.vue` — non modificato in questa sessione, ma è il punto centrale del pattern offline-first
- `src/idb/useTaskDB.js` — non modificato, layer IndexedDB invariato
