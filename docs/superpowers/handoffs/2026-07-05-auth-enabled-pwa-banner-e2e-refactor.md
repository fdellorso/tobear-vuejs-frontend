# Handoff — 2026-07-05 — Auth-enabled flag, PWA banner, E2E refactor

## Cosa è stato fatto

- **Flag `VITE_AUTH_ENABLED`** per nascondere login/registrazione in produzione:
  - `.env.development` → `VITE_AUTH_ENABLED=true`
  - `.env.production` → `VITE_AUTH_ENABLED=false`
  - Nuovo composable `src/composables/useAuthEnabled.js`
  - `DesktopSidebar.vue`: bottoni Accedi/Registrati in entrambi i blocchi (`guest` e `v-else`) avvolti da `v-if="authEnabled"`
  - `MobileNavFab.vue`: RouterLink login/register avvolti da `v-if="authEnabled"`
  - `router/index.js`: redirect `/login` e `/register` → `/todo` se `VITE_AUTH_ENABLED=false`

- **PwaInstallBanner.vue**: nuovo componente banner install PWA per mobile (`md:hidden`), con supporto iOS (share → Add to Home Screen) e Android (`beforeinstallprompt`), dismiss 7gg in localStorage, attesa consenso cookie. Inizialmente `z-40`, poi scambiato con MobileNavFab: ora `z-50`, FAB a `z-40`.

- **Traduzione i18n stringa hardcoded in DesktopSidebar**: rimosso lo span "task di cui X completati" nel blocco stats, sostituito con `$t('profile.statsLine', {...})`. Aggiunte chiavi `statsLine` in `en.json` e `it.json`.

- **E2E test aggiornati e riparati** (tutti i 14 test ora passano):
  - `auth-sync.spec.js`: placeholder `Titolo del task` → `Task title`; cookie banner dismiss con regex bilingue (`Rifiuta|Reject`); link FAB `Accedi` → `Sign in`
  - `guest-migration.spec.js`: placeholder e `Accedi` → `Sign in`; login click scoped a `form` (risolve strict mode violation da sidebar + form)
  - `spa-navigation.spec.js`: riscritto per testare la sidebar nell'architettura AppLayout 3-colonne a 1400px (About button → Contact button → Todo link)
  - `todo-task-enter.spec.js`: placeholder `Titolo del task` → `Task title`
  - `pwa-service-worker.spec.js`: placeholder `Titolo del task` → `Task title`

- **Separazione configurazione Playwright**:
  - Nuovo `playwright.pwa.config.js` dedicata ai test PWA, con `webServer` che esegue `npm run build && npx serve dist -l 4173`
  - `playwright.config.js`: aggiunto `testIgnore: ['**/pwa-service-worker.spec.js']` per escludere i PWA test dalla suite normale
  - `package.json`: nuovo script `test:e2e:pwa`

## Stato attuale

- **Lint**: 0 errori.
- **Test unitari (vitest)**: 3 suite, 34 test, tutti passanti.
- **Test E2E standard**: 10 test, tutti passanti (`npm run test:e2e`).
- **Test E2E PWA**: 4 test, tutti passanti (`npm run test:e2e:pwa`).
- **Working tree**: 18 file modificati/aggiunti, non committati. Branch `main` ahead di `origin/main` di 1 commit.
- **Login/register**: in development (`VITE_AUTH_ENABLED=true`) funzionanti; in produzione (`VITE_AUTH_ENABLED=false`) nascosti dalla UI e protetti da redirect router.
- **PWA banner**: funzionante su mobile, con dismiss 7gg, subordinato al consenso cookie.
- **Nessun TODO.md completato** in questa sessione — le attività erano tutte refactor/minutiae non tracciate nel TODO.

## Decisioni prese

- **`z-50` per PWA banner, `z-40` per FAB**: invertito l'ordine iniziale. Il banner deve stare sopra il FAB perché è l'elemento informativo da leggere/chiudere. Il FAB rimane comunque raggiungibile dopo avere chiuso/dismissato il banner.
- **Locale default `en`**: i test E2E usano i placeholder inglesi (`"Task title"`, `"Sign in"`). Il cookie banner è gestito con regex bilingue (`Rifiuta|Reject`) perché il locale può variare tra ambiente di test e sviluppo.
- **Config Playwright separata per PWA**: i test PWA richiedono build + serve su `:4173` (produzione-like), mentre gli altri test usano il dev server HTTPS su `:3000`. Separare le config evita di dover tenere il preview server sempre acceso.
- **Scoping `form` per login click**: `getByRole('button', { name: 'Sign in' })` risolve a 2 elementi (sidebar + form) sulla pagina `/login`. Usare `page.locator('form')` come scope garantisce di colpire il bottone di submit.

## Prossimi passi

1. **Committare e pushare** le modifiche accumulate (18 file).
2. **Verificare flicker del `v-else` in DesktopSidebar** — quando `mode` è `null` (store non ancora inizializzato), il `v-else` mostra login/register. Se c'è flicker, valutare un `v-if="mode !== null"` iniziale.
3. **TODO.md #26** — bug file temporanei `resize()` in `public/assets/` non puliti tra run di test backend — ancora aperto.
4. **Aggiornare TODO.md** se serve: valutare se aggiungere voci per `VITE_AUTH_ENABLED` (variabile d'ambiente documentata) e per PWA install banner.
5. **Contenuto contact in Markdown?** — decidere se anche il testo descrittivo di ContactContent va spostato in `.md` come già fatto per About.

## Note per il backend

- **Nessuna modifica API richiesta** in questa sessione. Tutto il lavoro è frontend-only.
- L'endpoint `POST /logout` (Sanctum) è già funzionante e chiamato correttamente con CSRF cookie da entrambi i componenti (DesktopSidebar, MobileNavFab).

## File rilevanti

- `.env.development` / `.env.production` — flag `VITE_AUTH_ENABLED`
- `src/composables/useAuthEnabled.js` — nuovo composable
- `src/components/PwaInstallBanner.vue` — nuovo componente banner install PWA
- `src/components/DesktopSidebar.vue` — `v-if="authEnabled"`, statsLine i18n
- `src/components/MobileNavFab.vue` — `v-if="authEnabled"`, z-index scambiato
- `src/router/index.js` — redirect login/register se auth disabilitato
- `src/views/AppLayout.vue` — import montaggio PwaInstallBanner
- `src/i18n/en.json` / `src/i18n/it.json` — sezione `pwa`, chiave `profile.statsLine`
- `playwright.config.js` — testIgnore per PWA
- `playwright.pwa.config.js` — nuova config separata per PWA con webServer
- `e2e/auth-sync.spec.js` — placeholder, cookie banner bilingue, Sign in link
- `e2e/guest-migration.spec.js` — placeholder, login scoped a form
- `e2e/spa-navigation.spec.js` — riscritto per sidebar
- `e2e/todo-task-enter.spec.js` — placeholder
- `e2e/pwa-service-worker.spec.js` — placeholder
- `package.json` — script `test:e2e:pwa`
