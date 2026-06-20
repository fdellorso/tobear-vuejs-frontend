# Handoff — 2026-06-20 — Diagnosi login e fix doppia crittografia cookie

## Cosa è stato fatto

- **Diagnosi completa del flusso di login** via Playwright: catturate tutte le richieste di rete, console messages, cookie, header di richiesta e risposta.
- **Identificate due cause distinte** del problema di login:
  1. `.env.development` usava `https://` per `VITE_API_BASE_URL` ma il backend Laravel serve solo HTTP. Le richieste partivano in HTTPS e non raggiungevano il backend.
  2. Doppia crittografia del cookie `laravel_session`: il middleware `EncryptCookies` era presente sia nella sub-pipeline di Sanctum (`EnsureFrontendRequestsAreStateful`) sia nell'append del gruppo `api` in `bootstrap/app.php`. La doppia crittografia corrompeva la sessione sulla richiesta successiva → prima richiesta autenticata OK, seconda richiesta 401.
- **Fix protocollo**: cambiato `.env.development` — `https://laravel.fritz.box:8000/api` → `http://laravel.fritz.box:8000/api` (stessa modifica per `VITE_BASE_URL`).
- **Fix doppia crittografia**: rimosso `\Illuminate\Cookie\Middleware\EncryptCookies::class` dall'array `append` del gruppo `api` in `bootstrap/app.php` (repo backend). `EncryptCookies` resta attivo nella sub-pipeline di Sanctum.
- **Verifica con Playwright** dopo il fix: login → 204 ✅, `/api/user` → 200 ✅, `/api/v1/tasks` → 200 ✅ (era 401).
- **Test PHP unitari** eseguiti: 9 passati, 1 skipped (solo il frontend build test).

## Stato attuale

- **Login**: funzionante e testato via Playwright (cookie puliti, login, redirect a /todo, fetch tasks).
- **Task endpoint**: `GET /api/v1/tasks` dopo login → 200 (era 401). Il fix della doppia crittografia risolve anche potenziali 401 intermittenti su altri endpoint protetti (`/v1/images`, `/v1/albums`, ecc.).
- **Sessioni persistenti**: il cookie `laravel_session` ora viene crittografato una sola volta (da Sanctum), quindi non viene corrotto tra richieste successive.
- **Backend**: va avviato con `php artisan serve --host=0.0.0.0 --port=8000` oppure da `public/` con `php -S 0.0.0.0:8000 vendor/laravel/framework/src/Illuminate/Foundation/resources/server.php`. Il comando `artisan serve` gestisce automaticamente il path corretto per `index.php`.

## Decisioni prese

- `EncryptCookies` va tenuto SOLO nella sub-pipeline di Sanctum, non nell'append del gruppo `api`, per evitare doppia crittografia. Sanctum già lo include come parte del suo middleware per richieste stateful (vedi `config/sanctum.php` → `'middleware'`).
- Il server PHP built-in deve essere avviato con `getcwd()` che punti a `public/`, altrimenti `server.php` cerca `index.php` nella directory sbagliata.
- La diagnosi è stata fatta interamente via Playwright (headless Chromium con `playwright-core` da `/tmp`), senza modificare codice frontend/backend durante l'investigazione.

## Prossimi passi

1. **Ripristinare il server backend in modo stabile** — la procedura attuale (`fuser -k 8000/tcp && cd backend/public && php -S ...`) è fragile. Valutare un docker-compose o un supervisor.
2. **Integrare TaskItem in TodoPage** (da TODO.md) — sbloccare swipe per completare/eliminare e cablare gli emit alle API (`PATCH /v1/tasks/{id}/complete`, `DELETE /v1/tasks/{id}`).
3. **Fixare lint** — installare `@eslint/json` per sbloccare `npm run lint`.
4. **Service worker navigateFallback** — verificare o creare `offline.html`.
5. **Reorder offline** — `reorderTasks` manca di fallback offline.
6. **Nessuna voce di TODO.md è stata completata in questa sessione** (login non era listato). Le attività rimangono invariate.

## Note per il backend

**Unico cambiamento lato backend in questa sessione:**

- `bootstrap/app.php`: rimosso `\Illuminate\Cookie\Middleware\EncryptCookies::class` dall'array `$middleware->api(append: [...])`. Il middleware è già presente nella sub-pipeline di `EnsureFrontendRequestsAreStateful` (via `config/sanctum.php`). La doppia istanza causava doppia crittografia del cookie di sessione e 401 sulla seconda richiesta autenticata consecutiva.

Nessun nuovo endpoint, campo, o modifica a route/controller.

## File rilevanti

- **`backend/bootstrap/app.php`** — fix doppia crittografia (rimosso EncryptCookies dall'append del gruppo api)
- **`frontend/.env.development`** — fix protocollo (https → http)
- `frontend/.env.production` — invariato (usa path relativi)
- `frontend/src/axios/index.js` — invariato, già corretto (withCredentials + withXSRFToken su entrambe le istanze)
- `frontend/src/stores/user.js` — invariato
- `frontend/src/router/index.js` — invariato
- `frontend/src/pages/LoginPage.vue` — invariato
- `handoffs/2026-06-20-audit-e-correzione-path-api.md` — handoff precedente
- `handoffs/2026-06-20-diagnosi-login-e-fix-cookie-cors.md` — questo file
