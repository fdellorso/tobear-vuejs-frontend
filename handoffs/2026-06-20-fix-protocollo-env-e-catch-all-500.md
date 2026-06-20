# Handoff — 2026-06-20 — Fix protocollo .env e catch-all 500

## Cosa è stato fatto

- **`backend/.env.development`**: `APP_URL` e `FRONTEND_URL` cambiati da `https://` a `http://` — coerenti con `backend/.env` e con `frontend/.env.development` (già fixato a http in una sessione precedente). Il protocollo https era residuo di una configurazione precedente che non rispecchia l'ambiente di sviluppo attuale (backend PHP artisan serve su http).
- **`backend/routes/web.php`**: catch-all (`Route::get('/{any}', ...)`) modificato per non causare 500 quando `public/app/index.html` non esiste (setup dev con frontend Vite separato). Ora:
  - Se `public/app/index.html` esiste → lo serve (produzione)
  - Se non esiste → redirect 302 a `config('app.frontend_url')` (dev)
- **`php artisan test`**: 9 passati, 1 skipped (`ExampleTest` — skippa se `public/app/index.html` manca, comportamento atteso).

## Stato attuale

- **Flusso auth (registrazione → verify email → login)**: navigazioni tutte client-side via `router.push()` / `router.replace()`. Nessun `window.location` o `<a href>` hardcoded nei componenti Vue.
- **Link verifica email**: punta al backend (`GET /api/verify-email/{id}/{hash}`) — inevitabile perché la verifica richiede il controller backend. Dopo verifica, `VerifyEmailController` fa redirect 302 a `FRONTEND_URL/login?verified=1`.
- **404/500 su navigazione accidentale al backend (porta 8000)**: risolto — invece di 500, ora redirect pulito verso la SPA.
- **Lint frontend**: ancora rotto a livello di configurazione ESLint (preesistente, non toccato in questa sessione).
- **`frontend/.env.development`**: già corretto a `http://` dalla sessione precedente.
- **`backend/bootstrap/app.php` e `backend/composer.json`**: hanno modifiche unstaged residue di sessioni precedenti (fix EncryptCookies, eventuali dipendenze), non toccati in questa sessione.

## Decisioni prese

- **`file_exists` guard sul catch-all**: scelto invece di un redirect incondizionato per mantenere compatibilità futura con un eventuale build del frontend dentro `public/app/`. La logica è: se il file c'è, serve la SPA; se non c'è (dev), reindirizza al Vite dev server.
- **Nessun fix al router guard per 409 su userStore.fetchUser**: il 409 per utente non verificato è comportamento atteso e non causa crash. Lo skip vale solo nel guard di navigazione, non rompe nulla.

## Prossimi passi

1. **Fixare lint frontend** — installare `@eslint/json` e configurare `eslint.config.js` per escludere `.opencode/` (preesistente, segnalato in handoff precedenti).
2. **Service worker navigateFallback** — verificare o creare `offline.html` per `vite-plugin-pwa` (preesistente).
3. **Sync locale senza lock** — `syncLocalTasks` non gestisce fallimenti parziali (preesistente).
4. **Collegare pagine image al router** — `MyImages`, `MyAlbums`, `UpLoad`, `ReSize` sono corretti ma scollegati dal router (feature pianificata fase 2 immagini, segnata in TODO.md).
5. **TODO.md**: nessuna voce completata in questa sessione. Le voci "PWA service worker cache" e "Riabilitare PWA + HTTPS" sono ancora aperte.

## Note per il backend

Nessuna nuova richiesta API in questa sessione. Modifiche fatte:
- `routes/web.php` — catch-all con redirect condizionale (nessun impatto sugli endpoint API esistenti)
- `.env.development` — solo variabili d'ambiente per ambiente di sviluppo

## File rilevanti

- `backend/.env.development` — APP_URL e FRONTEND_URL corretti a http
- `backend/routes/web.php` — catch-all con fallback redirect invece di 500
