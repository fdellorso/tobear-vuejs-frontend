# Handoff — 2026-06-29 — Premium nascosto dalla navigazione + primo test E2E Playwright stabile

## Cosa è stato fatto

### STEP 1 — Nascondere `/premium` dalla navigazione
- **File**: `src/router/index.js:52`
- **Modifica**: `meta: { requiresAuth: false, showInNav: true }` → `showInNav: false`
- **Conseguenza**: Premium non compare più nei menu di GuestLayout né in altri componenti che filtrano per `showInNav`. La route esiste ancora, il componente PremiumPage è intatto, raggiungibile via URL diretto.

### STEP 2 — Audit navigazione SPA + test Playwright permanente

**Audit `<a href>` e `window.location` nei `.vue`:**
- Cercate 4 occorrenze di `<a href="#"` in `src/components/tailwindplus/` (DescriptionList, ContactSection, CtaSection) — sono tutte placeholder di scaffolding Tailwind Plus con `href="#"`, nessuna naviga realmente.
- Zero occorrenze di `window.location` nei `.vue`.
- Tutta la navigazione interna usa `RouterLink` (66 occorrenze nei componenti tailwindplus).
- **Risultato**: nessun problema reale di navigazione.

**Primo test E2E stabile del progetto:**
- `e2e/spa-navigation.spec.js` — test Playwright che inietta una sentinella `window.__appLoaded` sulla pagina e verifica che sopravviva a 6 navigazioni click-through su link reali dell'interfaccia (Registrati → /register, Contact → /contact, About → /about, Log in → /login, Contact → /contact, About → /about).
- `playwright.config.js` — testDir `./e2e`, baseURL `https://laravel.fritz.box:3000`, ignoreHTTPSErrors: true.
- `package.json` — aggiunto script `"test:e2e": "playwright test"`.
- `AGENTS.md` — aggiunta sezione "Test E2E (Playwright)" con regole e comando, aggiornati i "Comandi utili" con `npm run test` e `npm run test:e2e`.
- `TODO.md` — riga 23 aggiornata da "Valutare se servono test E2E Playwright stabili" a fatta con descrizione.

## Stato attuale

- **Test E2E**: `npm run test:e2e` passa (1/1 test, ~3.4s). Il dev server deve essere già in esecuzione su `:3000`.
- **Lint**: invariato — 46 errori pre-esistenti (markdown lint su AGENTS.md/TODO.md + unused var PaginationElement), nessun nuovo errore introdotto.
- **Premium**: nascosto dalla navigazione, ma la route e il componente restano intatti.
- **Niente è rotto**: nessuna modifica a logica di business, store, API, o componenti Vue.

## Decisioni prese

- **Il test E2E `spa-navigation.spec.js` è permanente**, non script usa-e-getta. Il progetto adotta `@playwright/test` come framework di test E2E ufficiale, distinto dagli script ad-hoc usati in passato (es. `e2e-test.mjs`). Motivazione: per una PWA offline-first, l'integrità della navigazione client-side (Vue Router) è critica e va monitorata.
- **`playwright.config.js`** con `ignoreHTTPSErrors: true` e `baseURL` hardcoded a `https://laravel.fritz.box:3000`: coerente con la nota in TODO.md che avverte di non usare mai `localhost` per i test Playwright (cert/CORS/cookie domain mismatch con l'API su `laravel.fritz.box:8000`).
- **Nessuna modifica al filtro `navigationRoutes` in GuestLayout.vue/HomePage.vue**: `navigationRoutes.premium` esiste ancora ed è usato da HeroSection (inattivo). Cambiare `showInNav` è sufficiente per nascondere Premium dai menu; non serve eliminare il riferimento da `navigationRoutes`.

## Prossimi passi (in ordine di priorità)

1. **UX Desktop — hover-reveal buttons** per complete/delete (TODO.md riga 15-16) — sostituisce lo swipe mouse rimosso. Voce aperta da handoff 2026-06-28.
2. **Scrivere test Vitest per TaskItem.vue** (swipe, tap, editing, long-press) — voce aperta da handoff 2026-06-21, ancora non fatta.
3. **ProfileIcon.vue** — distinguere guest da authenticated (TODO.md riga 22, handoff 2026-06-28).
4. **Sync offline batch**: endpoint `POST /v1/tasks/batch-import` per importare task guest con stato completed/deleted in blocco (segnalato in handoff precedenti).
5. **Commit modifiche in sospeso**: 6 file modificati/nuovi (vedi sotto). Da committare prima di iniziare nuova sessione.

## Note per il backend

- **Nessuna nuova richiesta API in questa sessione**. Tutti i cambiamenti sono lato frontend (router, test, config).
- Da handoff precedenti: serve ancora `POST /v1/tasks/batch-import` per migrazione task guest.

## File rilevanti

- `src/router/index.js` — `showInNav: false` per `/premium`
- `e2e/spa-navigation.spec.js` — **nuovo**: primo test E2E Playwright stabile
- `playwright.config.js` — **nuovo**: configurazione Playwright
- `package.json` — aggiunto script `test:e2e`
- `AGENTS.md` — documentati test E2E e comando `test:e2e`
- `TODO.md` — riga 23 aggiornata (E2E stabile)

### Untracked
- `e2e/` (contiene `spa-navigation.spec.js`)
- `playwright.config.js`

### Modificati (non committati)
- `AGENTS.md`, `TODO.md`, `package.json`, `src/router/index.js`
