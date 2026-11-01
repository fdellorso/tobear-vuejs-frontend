# Handoff — 2026-07-03 — Suite E2E auth + sync offline

## Cosa è stato fatto

- Creato `e2e/auth-sync.spec.js` con 5 test E2E per il flusso guest/auth:
  1. **guest can create tasks locally** — crea task guest, verifica visibilità
  2. **login page is accessible and shows form** — naviga a `/login`, verifica heading e campi
  3. **register page is accessible** — naviga a `/register`, verifica heading e campi (`#reg-name`, `#reg-email`, `#reg-password`)
  4. **guest mode persists tasks after reload** — crea task, ricarica, verifica persistenza IndexedDB
  5. **SPA navigation between todo and login** — chiude cookie banner, apre FAB mobile, clicca "Accedi", verifica nessun full-page reload via `window.__appLoaded`

- Risolti i seguenti bug nei test durante la sessione:
  - `Cypress?.env?.('TEST_EMAIL')` → rimosso (era API Cypress, non Playwright)
  - `text=Sign in` e `text=Create account`: strict mode violation (matchavano 2 elementi) → `getByRole('heading', ...)`
  - `text=Accedi`: strict mode violation nel FAB popover (matchava sidebar button + FAB link) → `getByRole('link', ...)`
  - Cookie consent banner che intercettava click sul FAB → dismiss pattern replicato da `spa-navigation.spec.js`
  - Aggiunte `waitForSelector` con timeout 10s per l'input task (il fallimento del server rendeva l'attesa fragile)

- Avviati e verificati entrambi i server:
  - Frontend Vite: `npm run dev &` su `:3000` (via Caddy)
  - Backend Laravel: `php artisan serve --host=0.0.0.0 --port=8001 &` (via Caddy su `:8000`)

## Stato attuale

- **7 test E2E tutti passanti** (33s):
  - 5 in `auth-sync.spec.js` — tutti ✅
  - 1 in `spa-navigation.spec.js` — ✅ (link nav skippati perché non visibili in guest viewport xl+)
  - 1 in `todo-task-enter.spec.js` — ✅
- File `e2e/auth-sync.spec.js` è **untracked** — non ancora committato.
- `git status`: branch `main` ahead of `origin/main` by 1 commit (preesistente), solo il nuovo file è unstaged.
- Servers left running: Vite su `:3000`, artisan su `:8001`.
- Nessuna modifica a TODO.md in questa sessione.

## Decisioni prese

- **Login via FAB mobile**: il FAB popover usa `<a href="/login">` per "Accedi" (non `<button>`). Confermato dal test: `getByRole('link', { name: 'Accedi' })` funziona.
- **Pattern dismiss cookie banner**: replicato fedelmente da `spa-navigation.spec.js` (controllo `isVisible` con `.catch(() => false)` poi click su "Rifiuta"). È un pattern ormai standard per tutti i test E2E che interagiscono con elementi in basso a sinistra/zona FAB.
- **`waitForSelector` con timeout esplicito**: l'input task può non essere immediatamente disponibile in condizioni di rete/server lenta. `waitForLoadState('networkidle')` non basta — `waitForSelector` dà garanzia più solida.
- **Test non committati**: la nuova suite non è ancora in staging. È intenzionale — aspetta revisione prima di commit.

## Prossimi passi

1. **Verificare perché i link nella sidebar (Registrati, Contact, About, Log in) non sono visibili nei test su viewport 1400×900** — `spa-navigation.spec.js` skippa tutti e 6 i passi. Potrebbe essere un problema di autenticazione (sidebar mostra link diversi per guest vs autenticato) o di rendering condizionale. Da investigare.
2. **Committare `e2e/auth-sync.spec.js`** dopo approvazione.
3. **TODO.md #16** (UX desktop hover-reveal buttons) — ancora la priorità più alta non completata.
4. **TODO.md #18** (HomePage.vue) — decidere recupero o rimozione.
5. **Scrivere test Vitest per TaskItem.vue** (swipe, editing, long-press) — voce aperta da handoff precedenti.
6. **Verificare se `e2e/todo-task-enter.spec.js`** è affetto dallo stesso problema di visibilità input task quando il server non è partito (ha un timeout di soli 3s).

## Note per il backend

- Nessuna richiesta di modifica API in questa sessione.
- Endpoint `POST /v1/tasks/batch-import` per sync offline batch è ancora pendente (TODO.md #31) ma non bloccante per i test attuali.

## File rilevanti

- `e2e/auth-sync.spec.js` — nuova suite test E2E auth + sync
- `playwright.config.js` — config invariata (testDir: `./e2e`, baseURL: `https://laravel.fritz.box:3000`)
- `handoffs/2026-07-02-design-system-temi-chiaro-scuro.md` — handoff precedente
- `handoffs/2026-07-02-migrazione-auth-tb-e-refactor-componenti.md` — handoff precedente
