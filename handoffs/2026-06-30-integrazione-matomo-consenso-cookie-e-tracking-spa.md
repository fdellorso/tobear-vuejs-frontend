# Handoff — 2026-06-30 — Integrazione Matomo: env vars, consenso cookie, tracking SPA

## Cosa è stato fatto

### Problema 0 — Config hardcoded → env vars
- Spostati `host` e `siteId` di Matomo da hardcoded in `src/main.js` a variabili d'ambiente:
  - `.env.development` → `VITE_MATOMO_HOST=https://laravel.fritz.box:8080`, `VITE_MATOMO_SITE_ID=1`
  - `.env.production` → `VITE_MATOMO_HOST=` (vuoto), `VITE_MATOMO_SITE_ID=` (vuoto)
  - `.env` (gitignorato) → stessi valori di development
- `src/main.js` ora legge `import.meta.env.VITE_MATOMO_HOST` e `VITE_MATOMO_SITE_ID` tramite funzione `initMatomo(appInstance)`
- Se le env var sono vuote (es. produzione senza valori configurati), Matomo non viene inizializzato (early return)

### Problema 1 — Banner consenso cookie (CookieConsent.vue)
- Creato `src/components/CookieConsent.vue`:
  - Banner fisso in basso, sfondo `gray-900/95` con `backdrop-blur-sm`, stile sobrio coerente col progetto
  - Testo: "Usiamo Matomo (self-hosted) per capire come viene usato toBear. Nessun dato viene condiviso con terzi."
  - Due bottoni: "Rifiuta" (bianco semi-trasparente) e "Accetta" (ambra — colore primario del progetto)
  - Stato salvato in `localStorage` chiave `matomo_consent` (valori: `'accepted'` | `'rejected'`)
  - Il banner appare **solo** se non c'è già una scelta in `localStorage`
- **Init condizionale**: Matomo NON viene caricato finché l'utente non clicca "Accetta"
  - Se `localStorage` ha `'accepted'` → `initMatomo(app)` chiamato **prima** di `app.mount('#app')`
  - Se `localStorage` ha `'rejected'` o non esiste → Matomo non parte
  - Al click "Accetta": salva in localStorage + chiama `window.__initMatomo()` (esposta da `main.js`) che esegue `app.use(VueMatomo, ...)` **post-mount**
  - Al click "Rifiuta": salva `'rejected'`, banner sparisce, Matomo mai caricato (zero network request)

### Problema 2 — Tracking SPA vs manuale
- Rimossa riga `window._paq.push(['trackPageView'])` (track manuale singolo al load)
- Ora `vue-matomo` riceve `router: router` nella config → attiva automaticamente:
  - `trackInitialView: true` (default) → pageview sulla rotta iniziale
  - `router.afterEach(...)` → pageview a ogni cambio di rotta SPA
- Non serve più nessun `_paq.push` manuale

### Test pratico di verifica (poi rimosso)
- Creato `test-matomo-postmount.mjs` temporaneo (cancellato dopo il test)
- Verificato con Playwright Chromium che `app.use(VueMatomo, ...)` chiamato **dopo** `app.mount()` funzioni:
  - ✅ `Piwik` globale caricato, tracker con `siteId: 1` e `trackerUrl: matomo.php`
  - ✅ Navigazione SPA a `/contact` → richiesta `POST matomo.php?action_name=%2Fcontact&idsite=1` captata
- **Risultato**: post-mount `app.use()` funziona, plugin si integra correttamente con router già attivo

### App.vue
- Importato e montato `<CookieConsent />` dopo `<RouterView />`

## Stato attuale
- **Tutto implementato e funzionante**. I 3 problemi (env vars, consenso, tracking SPA) sono risolti.
- **Nessuna modifica lato backend richiesta**. Matomo è self-hostato e già configurato sul server.
- **Lint**: 46 errori pre-esistenti invariati (markdown lint in AGENTS.md/TODO.md, PaginationElement unused var) — zero nuovi.
- **Test E2E esistenti** (`spa-navigation.spec.js`, `todo-task-enter.spec.js`) non toccati. CookieConsent banner è in App.vue, fuori dai layout, quindi non interferisce con i test esistenti (che testano navigazione e creazione task). Tuttavia, su page load il banner ora appare — nessun test fa assertion sulla sua presenza/assenza.
- **Modifiche non committate** — vedi `git status` per i file modificati/untracked.

## Decisioni prese
- **Deferred `app.use()` vs `requireConsent` di Matomo**: scelto di non inizializzare affatto il plugin prima del consenso (zero network request al server Matomo), invece di usare `requireConsent: true` che carica comunque lo script. Questo è più rispettoso della privacy e blocca anche il fingerprinting via caricamento script.
- **Post-mount `app.use()` testato e funzionante**: la funzione `initMatomo()` può essere chiamata sia prima che dopo `app.mount('#app')`. Il plugin vue-matomo non dipende dal mount di Vue per funzionare — usa solo `globalProperties`, `provide` (nessun componente usa inject), e `router.afterEach` (funziona anche se router è già attivo).
- **`window.__initMatomo` come meccanismo di init differito**: scelto invece di un event emitter o store Pinia perché il CookieConsent è un componente semplice e l'inizializzazione di Matomo è un side-effect globale, non un dato di stato applicativo. La funzione è minimale e non merita un layer aggiuntivo.
- **Banner in App.vue (non nei layout)**: il consenso cookie deve apparire indipendentemente dallo stato di autenticazione (sia per utenti loggati che guest). App.vue è il punto giusto. Se in futuro si volesse escluderlo da pagine specifiche, si può aggiungere un prop o una condizione basata su route meta.

## Prossimi passi
1. **UX Desktop — hover-reveal buttons** per complete/delete (TODO.md riga 15-16) — voce aperta da handoff 2026-06-28.
2. **Scrivere test Vitest per TaskItem.vue** (swipe, tap, editing, long-press) — voce aperta da handoff 2026-06-21.
3. **ProfileIcon.vue** — distinguere guest da authenticated (TODO.md riga 22, handoff 2026-06-29).
4. **Sync offline batch**: endpoint `POST /v1/tasks/batch-import` (da handoff precedenti, TODO.md riga 28).
5. **Considerare commit** delle modifiche correnti se lo stato lo permette.

Nessuna nuova voce in TODO.md da aggiungere — questa sessione non era elencata nella roadmap.

## Note per il backend
- **Nessuna nuova richiesta API in questa sessione**. Tutti i cambiamenti sono lato frontend.
- Matomo è self-hostato su `laravel.fritz.box:8080` (interno), nessuna dipendenza dal backend Laravel.
- Da handoff precedenti: serve ancora `POST /v1/tasks/batch-import` e `POST /v1/contact`.

## File rilevanti
- `src/main.js` — init condizionale di Matomo, env vars, `window.__initMatomo`, `router` passato al plugin
- `src/components/CookieConsent.vue` — **nuovo**: banner consenso cookie con localStorage
- `src/App.vue` — montato CookieConsent
- `.env.development` — aggiunte `VITE_MATOMO_HOST` e `VITE_MATOMO_SITE_ID`
- `.env.production` — aggiunte (vuote)
- `.env` (gitignorato) — aggiunte (stessi valori di development)
