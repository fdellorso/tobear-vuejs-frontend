# toBear — Frontend (Vue + Vite + Tailwind)

App todo in stile [Clear](https://www.useclear.com/), PWA offline-first.
Stack: Vue 3 (script setup), Vite, Tailwind CSS v4, Pinia, vue-router, axios, idb (IndexedDB), vuedraggable, vite-plugin-pwa.

## Bootstrap di sessione

All'inizio di OGNI sessione, in quest'ordine:

1. Leggi questo AGENTS.md per intero.
2. Leggi `TODO.md` nella root del progetto — è la roadmap manuale mantenuta dall'utente, sempre aggiornata.
3. Leggi gli ultimi 2 file in `handoffs/` (più recente per primo).
4. Solo dopo, chiedi cosa si vuole fare oggi.

Se l'utente dice "leggi gli handoff" o "riprendi da dove eravamo", esegui i punti 1-3 senza chiedere conferma.

## Architettura

```text
src/
  axios/index.js        # axiosClient (cookie+XSRF auth), axiosCSRF, helper withCSRF
  stores/                # Pinia, Options API style (non Composition API per gli store)
  router/index.js        # route con meta.requiresAuth / meta.guest
  idb/useTaskDB.js        # wrapper IndexedDB per cache offline dei task
  components/             # componenti riusabili
  pages/                  # una pagina per route
  views/                  # layout (AppLayout — unico layout)
```

## Layout e navigazione

Il layout principale è `AppLayout` (`src/views/AppLayout.vue`), usato da tutte le route visibili all'utente (`/todo`, `/about`, `/contact`).

Struttura responsive:
- Mobile (`< md`): nessun header, FAB in basso a sinistra (`MobileNavFab.vue`) con popover Headless UI per navigazione
- Desktop stretto (`md`-`xl`): stesso FAB, nessun header
- Desktop largo (`≥ xl`): griglia a 3 colonne — `DesktopSidebar` (sinistra) | `RouterView` (centro) | `DesktopContentPanel` (destra, opzionale)

Tutte le route sotto AppLayout: `/todo`, `/about`, `/contact`, `/login`, `/register`, `/verifyemail`, `/premium`, `/user`, `/setting`

Comportamento speciale: su desktop largo (`≥ 1280px`), navigare a `/about` o `/contact` apre automaticamente il pannello destro e reindirizza a `/todo` — la colonna centrale mostra sempre la todo list, about/contact vanno nel pannello destro.

## Convenzioni di progetto (NON assumere, usa queste)

- **Componenti**: sempre `<script setup>`, mai Options API nei componenti (gli store Pinia invece usano lo stile Options — non è un'incoerenza da "correggere", è la convenzione attuale).
- **Auth**: cookie-based via Sanctum. `axiosClient` ha `withCredentials: true` e `withXSRFToken: true`. Per richieste che richiedono CSRF (login, register), usa l'helper `withCSRF(callback)` che fa prima `GET /sanctum/csrf-cookie`. Non passare a token Bearer in `localStorage` — è un anti-pattern già scartato nel progetto (vedi codice commentato in `axios/index.js`).
- **Offline-first per i task**: pattern attuale in `TodoPage.vue` →
  - fetch da rete, se ok salva in IndexedDB (`saveTasks`) e poi rilegge da lì (`getAllTasks`) per coerenza con l'ordinamento locale.
  - se la rete fallisce, fallback a `getAllTasks()` da IndexedDB.
  - creazione offline: task locale con id `local-${Date.now()}` e flag `localOnly: true`, salvato in IndexedDB e pushato in UI optimisticamente.
  - sync: listener su `window.addEventListener('online', ...)` che richiama `syncLocalTasks()` per inviare al backend i task con `localOnly: true`.
  - Replica questo pattern per qualunque nuova entità offline-capable (vedi roadmap PWA in TODO.md), non inventarne un altro.
- **Drag & drop**: `vuedraggable` con `v-model` sull'array reattivo + evento `@end` che richiama un metodo di reorder che aggiorna `order` localmente e poi chiama l'API (`PATCH /v1/tasks/reorder`).
- **Styling**: Tailwind v4 (plugin Vite, non PostCSS config separata). Usa i token `tb-*` del design system in `src/assets/themes.css`. Per componenti UI comuni (modali, dropdown, form layout) riusa pattern esistenti invece di scriverli da zero.
- Non lasciare blocchi di codice commentato nel codebase — il codice morto va rimosso. Se serve storico, esiste git.
- **Lingua**: stringhe utente-facing gestite da **vue-i18n** con default `en` e fallback `en`. Backend produce messaggi in **inglese**. Non scrivere stringhe italiane hardcoded.

## Workflow di modifica

- Usa `npm run lint` e `npm run format` prima di considerare concluso un task.
- Quando una modifica richiede un cambiamento lato API, segnalalo esplicitamente: il backend è in un repo separato (`tobear-laravel-backend`) gestito con un'altra sessione OpenCode.
- "Non modificare ancora" → solo analisi, nessuna modifica ai file.
- Variabili d'ambiente: `VITE_API_BASE_URL` e `VITE_BASE_URL` in `.env.development` / `.env.production`. Non hardcodare URL.

## Comandi utili

```bash
npm run dev       # vite dev server, host 0.0.0.0:3001, http
npm run build
npm run lint
npm run format
npm run test      # vitest (unitari)
npm run test:e2e  # playwright test (E2E)
```

## Cosa NON fare

- Non introdurre state management diverso da Pinia o librerie di fetching aggiuntive (es. TanStack Query) senza richiesta esplicita — preferenza nota per setup minimali.
- Non rimuovere il layer IndexedDB/offline per "semplificare" — è un requisito di prodotto (PWA offline, vedi TODO.md).
- Non cambiare lo stile degli store Pinia da Options a Composition API senza richiesta esplicita.
- Non eseguire `git push` o aprire PR senza richiesta esplicita.

## Skills disponibili

- `vue-conventions` — struttura componenti/pagine/store, naming, script setup vs Options API.
- `offline-sync-pattern` — il pattern IndexedDB + sync online/offline da replicare per nuove feature.
- `tailwind-styling` — uso di Tailwind v4 e del design system tb-* token per lo styling.
- `frontend-design` (Anthropic, installata via `npx skills add anthropics/skills`) — guida a scelte estetiche deliberate (tipografia, palette, spaziatura) ed evita pattern visivi generici/abusati.

**Quando usare `tailwind-styling` vs `frontend-design`:**
- Stai estendendo o riusando UI già esistente (pattern TB esistenti, modali, form, dropdown) → `tailwind-styling`, usa i token tb-*.
- Stai progettando qualcosa di nuovo e specifico per toBear, dove l'identità visiva conta (es. il componente TaskItem con swipe, l'onboarding, la home page) → `frontend-design`, per fare scelte estetiche intenzionali coerenti con lo stile Clear, non il default scaffolded.
- In caso di dubbio, parti da `tailwind-styling` per la struttura/i componenti di base, poi applica `frontend-design` per le decisioni di stile fine (colori, font, spacing) invece di accettare i default.

## Test E2E (Playwright)

- `playwright.config.js` → `testDir: './e2e'`, `baseURL: 'https://laravel.fritz.box:3000'`, `ignoreHTTPSErrors: true`.
- I test E2E sono **stabili e permanenti**, non script ad-hoc.
- Eseguire con `npm run test:e2e` (dev server già running su `:3000`).
- Primo test: `e2e/spa-navigation.spec.js` — verifica che non ci siano full-page reload durante navigazione interna (sentinella `window.__appLoaded`). Se un `<a href>` invece di `RouterLink` si intrufolasse in futuro, questo test lo rileva.

## Fine sessione

Prima di chiudere una sessione di lavoro significativa, esegui `/handoff` per scrivere il file di handoff in `handoffs/`.

## Stack tecnologico (versioni al 2026-07-05)

| Tecnologia | Versione |
|---|---|
| Node.js | 24.18.0 |
| npm | 10.9.8 |
| Vue | 3.5.13 |
| Vite | 6.2.4 |
| Tailwind CSS | 4.1.5 |
| vue-router | 4.5.1 |
| Pinia | 3.0.2 |
| vue-i18n | 11.4.6 |
| vite-plugin-pwa | 1.0.0 |

## Produzione (x10hosting — fase test)

- Dominio: tobear.x10.mx
- Matomo: stats.tobear.x10.mx (già configurato)
- Deploy: GitHub Actions → FTP (SamKirkland/FTP-Deploy-Action)
- Deploy target: `backend/public/app/` (backend catch-all serve SPA)
- `VITE_BASE_URL=/app/` in `.env.production`
- `VITE_API_BASE_URL=/api` (same-origin, relativo)
- Auth nascosta: `VITE_AUTH_ENABLED=false` in `.env.production`
- Obiettivo immediato: validazione PWABuilder
- Obiettivo futuro: pubblicazione Play Store (dopo Namecheap + liste annidate + premium)
