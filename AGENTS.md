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

```
src/
  axios/index.js        # axiosClient (cookie+XSRF auth), axiosCSRF, helper withCSRF
  stores/                # Pinia, Options API style (non Composition API per gli store)
  router/index.js        # route con meta.requiresAuth / meta.guest
  idb/useTaskDB.js        # wrapper IndexedDB per cache offline dei task
  components/             # componenti riusabili
    tailwindplus/         # componenti scaffolded da Tailwind Plus, non toccare lo stile base se non necessario
  pages/                  # una pagina per route
  views/                  # layout (DefaultLayout = autenticato, GuestLayout = pubblico)
```

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
- **Styling**: Tailwind v4 (plugin Vite, non PostCSS config separata). I componenti in `components/tailwindplus/` sono scaffolding di Tailwind Plus: riusali/adattali invece di scrivere component custom da zero per pattern UI comuni (modali, dropdown, form layout, ecc.).
- **Codice commentato**: nel codebase trovi blocchi di codice commentati (vecchie implementazioni). Sono lasciati intenzionalmente come storico/riferimento durante lo sviluppo attivo — non cancellarli automaticamente durante refactor minori; se non servono più chiedi conferma o segnalalo nell'handoff.
- **Lingua**: stringhe utente-facing e commenti in italiano, coerente col backend.

## Workflow di modifica

- Usa `npm run lint` e `npm run format` prima di considerare concluso un task.
- Quando una modifica richiede un cambiamento lato API, segnalalo esplicitamente: il backend è in un repo separato (`tobear-laravel-backend`) gestito con un'altra sessione OpenCode.
- "Non modificare ancora" → solo analisi, nessuna modifica ai file.
- Variabili d'ambiente: `VITE_API_BASE_URL` e `VITE_BASE_URL` in `.env.development` / `.env.production`. Non hardcodare URL.

## Comandi utili

```bash
npm run dev       # vite dev server, host 0.0.0.0:3000, https (mkcert)
npm run build
npm run lint
npm run format
```

## Cosa NON fare

- Non introdurre state management diverso da Pinia o librerie di fetching aggiuntive (es. TanStack Query) senza richiesta esplicita — preferenza nota per setup minimali.
- Non rimuovere il layer IndexedDB/offline per "semplificare" — è un requisito di prodotto (PWA offline, vedi TODO.md).
- Non cambiare lo stile degli store Pinia da Options a Composition API senza richiesta esplicita.
- Non eseguire `git push` o aprire PR senza richiesta esplicita.

## Skills disponibili

- `vue-conventions` — struttura componenti/pagine/store, naming, script setup vs Options API.
- `offline-sync-pattern` — il pattern IndexedDB + sync online/offline da replicare per nuove feature.
- `tailwind-styling` — uso di Tailwind v4 e dei componenti tailwindplus esistenti.
- `frontend-design` (Anthropic, installata via `npx skills add anthropics/skills`) — guida a scelte estetiche deliberate (tipografia, palette, spaziatura) ed evita pattern visivi generici/abusati.

**Quando usare `tailwind-styling` vs `frontend-design`:**
- Stai estendendo o riusando UI già esistente (modali, form, dropdown coperti da `components/tailwindplus/`) → `tailwind-styling`, riusa quello che c'è.
- Stai progettando qualcosa di nuovo e specifico per toBear, dove l'identità visiva conta (es. il componente TaskItem con swipe, l'onboarding, la home page) → `frontend-design`, per fare scelte estetiche intenzionali coerenti con lo stile Clear, non il default scaffolded di Tailwind Plus.
- In caso di dubbio, parti da `tailwind-styling` per la struttura/i componenti di base, poi applica `frontend-design` per le decisioni di stile fine (colori, font, spacing) invece di accettare i default.

## Fine sessione

Prima di chiudere una sessione di lavoro significativa, esegui `/handoff` per scrivere il file di handoff in `handoffs/`.
