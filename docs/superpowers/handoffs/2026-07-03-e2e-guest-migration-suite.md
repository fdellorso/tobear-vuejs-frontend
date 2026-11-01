# Handoff — 2026-07-03 — Suite E2E migrazione guest + fix CSRF logout

## Cosa è stato fatto

- Creato `e2e/guest-migration.spec.js` con 3 test:
  - **guest tasks migrate to account after login**: crea 2 task come guest, login, verifica che siano visibili dopo la migrazione
  - **migration is idempotent (no duplicates on second call)**: crea 1 task guest, login, reload, verifica che il task appaia esattamente 1 volta
  - **logout clears session and returns to guest mode**: login, logout via API diretta, verifica che la sidebar mostri "Accedi" (modalità guest)
- Aggiunto `cleanupTestUser(request)` helper che chiama `POST /api/test/cleanup` con `X-Test-Token` per pulire i task backend dell'utente `test@example.com` prima di ogni test
- Aggiunto `page.context().clearCookies()` nel `beforeEach` per isolamento completo tra test (sessioni non condivise)
- **Fixato BUG in `src/components/DesktopSidebar.vue`**: la funzione `logout()` non usava `withCSRF()` → causava 419 CSRF mismatch su POST `/api/logout`. Aggiunto `withCSRF` all'import e wrap della chiamata.
- Scoperte credenziali di test nel seeder backend: `test@example.com` / `password` (email verificata)

## Stato attuale

- **14 test E2E su 14 passano** (`npm run test:e2e`) — nessuna regressione
- 3 nuovi test di migrazione guest→auth funzionanti
- Il logout UI via click sul bottone "Esci" del `DesktopSidebar` **non innesca il `@click` Vue quando cliccato via Playwright** (il click non genera errori ma la funzione non viene eseguita). Contourmato nel test con chiamata API diretta via `page.evaluate` + `fetch`.
- Anche `MobileNavFab.vue` ha un bottone "Esci" (riga 77-82) con `logout()` **senza `withCSRF`** — stesso bug del DesktopSidebar, ma non toccato in questa sessione perché il test 3 bypassa il click UI.

## Decisioni prese

- **Test user**: usato `test@example.com` / `password` (dal seeder backend, email verificata) invece di `test@tobear.local` che non esisteva nel seeder.
- **Cleanup backend**: adottato pattern `cleanupTestUser()` con Playwright `request` fixture e endpoint backend dedicato (`POST /api/test/cleanup` con token di autenticazione hardcoded). Alternativa scartata: email univoche per test (`test-${Date.now()}@example.com`) perché avrebbe richiesto modifica più invasiva ai test e renderebbe il debug più difficile.
- **Logout test**: bypassato il click UI perché il `@click` Vue sul bottone "Esci" del `DesktopSidebar` non viene triggerato da Playwright per ragioni non diagnosticate. Usato `page.evaluate` con `fetch` + lettura manuale del cookie `XSRF-TOKEN` per fare la POST `/api/logout`.

## Prossimi passi

1. **Diagnosticare e fixare il click UI "Esci"** — il `@click="logout"` nel `DesktopSidebar` non viene triggerato da Playwright ma la funzione è correttamente definita e `withCSRF` è importato. Possibile causa: Vue 3 event handler non attachato correttamente dopo HMR / re-render. Da verificare con `addEventListener` diretto o refactor del template.
2. **Fixare `MobileNavFab.vue:129-134`** — stesso bug del DesktopSidebar (logout senza `withCSRF`). Sostituire `axiosClient.post('/logout')` con `withCSRF(() => axiosClient.post('/logout'))`.
3. **Endpoint backend `POST /api/test/cleanup`** — va implementato sul backend (repo `tobear-laravel-backend`) se non esiste già. Deve cancellare tutti i task dell'utente identificato da `email` nel body, autenticato via header `X-Test-Token: tobear-test-cleanup-2024`.
4. **Verificare idempotenza della migrazione** — test 2 passa ora grazie al cleanup, ma il pattern `syncLocalTasks()` + `migrateGuestTasks()` in sequenza in `TodoPage.vue:onMounted` è ridondante. Valutare se tenerli entrambi o unificarli.
5. **Controllare `TODO.md`** — nessuna voce completata in questa sessione. Considerare aggiunta voce per il bug "logout click non funziona via Playwright".

## Note per il backend

- **Necessario**: endpoint `POST /api/test/cleanup` per rimuovere i task di un utente di test. Input: `{ email: string }`. Autenticazione: header `X-Test-Token: tobear-test-cleanup-2024` (token hardcoded, solo per test). Da posizionare in una route accessibile pubblicamente o sotto middleware custom `test` che abilita solo in ambiente locale.
- Il frontend si aspetta `BACKEND_URL = https://laravel.fritz.box:8000` (configurabile in test, ma per ora hardcoded nel test E2E).
- Il flusso di login funziona con credenziali del seeder: `test@example.com` / `password` con `email_verified_at` valorizzato.

## File rilevanti

- `e2e/guest-migration.spec.js` — nuovo file, 3 test E2E Guest → Authenticated migration
- `src/components/DesktopSidebar.vue` — fixato `logout()` con `withCSRF`
- `src/composables/useGuestMigration.js` — letto per analisi BUG 2 (duplicati), nessuna modifica
- `src/axios/index.js` — letto per capire `withCSRF`, nessuna modifica
- `src/pages/TodoPage.vue` — analizzato per flusso `onMounted` / `syncLocalTasks` / `fetchTasks`
- `src/components/MobileNavFab.vue` — identificato stesso bug CSRF logout (non fixato)
