# Handoff — 2026-06-20 — Audit e correzione path API

## Cosa è stato fatto

- **Audit completo** del frontend: route, store, chiamate axios, IndexedDB, convenzioni, test, dipendenze.
- **Fix 1 — Path API desincronizzati.** Backend ha rinominato `/v1/album` → `/v1/albums`, `/v1/myimages` → `/v1/images`, rimosso `POST /v1/myimages/{id}/delete` (ridondante con DELETE). Correzione in 3 file:
  - `UpLoad.vue`: `POST /v1/myimages` → `POST /v1/images`
  - `MyImages.vue`: `POST /v1/myimages/{id}/delete` → `DELETE /v1/images/{id}`; `GET /v1/myimages` → `GET /v1/images`
  - `MyAlbums.vue`: `POST /v1/image/{id}/delete` → `DELETE /v1/albums/{id}`; `GET /v1/image` → `GET /v1/albums`
  - `ReSize.vue`: nessuna modifica, path `POST /v1/image/resize` è invariato (conferma ricevuta).
- **Fix 2 — Campo inesistente in ImageGallery.** Rimosso `{{ image.name }}` (campo che il backend non invia più). Rimane solo `{{ image.label }}`.
- **Fix 3 — Import errato.** `MyImages.vue` e `MyAlbums.vue` importavano `@/components/ImageGallery.vue` → corretto in `@/components/image/ImageGallery.vue`.
- **Fix 4 — Route name errato in RegisterPage.** `router.push({ name: 'EmailVerification' })` → `'VerifyEmail'` (coerente col nome registrato in router/index.js).
- **Fix 5 — Service worker con URL hardcoded.** `vite.config.js`: sostituito regex `/^https:\/\/tobear\.x10\.mx\/api\/.*$/` con funzione che legge `VITE_API_BASE_URL` dall'environment, funziona sia con URL assoluti (dev) che relativi (prod).

## Stato attuale

- **Auth (login, register, logout, forgot-password, verify-email)**: funzionante e testato.
- **Task CRUD + offline-first**: funzionante (IndexedDB con sync online, drag & drop reorder).
- **Pagine pubbliche (Home, Premium, About, Contact, NotFound)**: placeholder Tailwind Plus, ok per ora.
- **Pagine immagine (MyImages, MyAlbums, UpLoad, ReSize)**: codice presente e corretto, ma **volutamente scollegate dal router** (feature pianificata per fase 2: immagini come todo).
- **TaskItem (swipe left/right)**: componente scritto e funzionante, ma **non integrato** in TodoPage (commentato).
- **Service worker**: ora usa dinamicamente `VITE_API_BASE_URL` invece del dominio hardcoded.
- **Test**: zero. Nessun framework installato.
- **Lint**: rotto — `eslint.config.js` richiede `@eslint/json` non installato. Preesistente.

## Decisioni prese

- Le pagine `src/pages/image/` NON sono codice morto. Sono una feature pianificata (immagini come todo, fase 2). I bug sono stati corretti ma restano scollegate dal router.
- Il path di resize (`/v1/image/resize`) è stato volutamente lasciato invariato perché l'endpoint backend non è stato rinominato.
- Il service worker ora usa una funzione `urlPattern({ url })` invece di un regex statico, leggendo `env.VITE_API_BASE_URL` già disponibile nel contesto di `vite.config.js` (grazie a `loadEnv`).

## Prossimi passi

1. **Integrare TaskItem in TodoPage** — sbloccare swipe per completare/eliminare e cablare gli emit alle API (`PATCH /v1/tasks/{id}/complete`, `DELETE /v1/tasks/{id}`). È l'item più caldo in TODO.md.
2. **Fixare lint** — installare `@eslint/json` (`npm install -D @eslint/json`) per sbloccare `npm run lint`.
3. **Service worker: navigateFallback** — l'opzione `navigateFallback: '/offline.html'` in vite.config.js punta a una pagina che potrebbe non esistere. Verificare o creare `offline.html`.
4. **Reorder offline** — `reorderTasks` in TodoPage chiama l'API ma se la rete fallisce, l'errore viene solo loggato. Non c'è fallback offline per il reorder (anche se IndexedDB viene aggiornato).
5. **Sync locale senza lock** — `syncLocalTasks` non gestisce fallimenti parziali. Da migliorare con un approccio a coda.
6. **Collegare pagine image al router** quando si passa alla fase 2.

## Note per il backend

Nessuna nuova richiesta. I path API corretti in questa sessione sono:
- `GET /v1/images`
- `POST /v1/images`
- `DELETE /v1/images/{id}`
- `GET /v1/albums`
- `DELETE /v1/albums/{id}`
- `POST /v1/image/resize` (invariato)

Verificare che `DELETE /v1/images/{id}` e `DELETE /v1/albums/{id}` siano effettivamente implementati (erano già presenti, il fix ha solo sostituito le vecchie chiamate `POST .../delete`).

## File rilevanti

- `src/pages/image/UpLoad.vue` — path API corretto
- `src/pages/image/MyImages.vue` — path API + import corretti
- `src/pages/image/MyAlbums.vue` — path API + import corretti
- `src/pages/image/ReSize.vue` — nessuna modifica (verificato)
- `src/components/image/ImageGallery.vue` — rimosso `image.name`
- `src/pages/RegisterPage.vue` — route name corretto
- `vite.config.js` — service worker urlPattern dinamico
- `AGENTS.md` — creato in questa sessione (convenzioni progetto)
- `handoffs/2026-06-20-audit-e-correzione-path-api.md` — questo file
