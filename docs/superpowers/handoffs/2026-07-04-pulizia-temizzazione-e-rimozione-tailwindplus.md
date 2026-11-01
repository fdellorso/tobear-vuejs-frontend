# Handoff — 2026-07-04 — Pulizia temizzazione e rimozione layout legacy

## Cosa è stato fatto

- **Temizzato `VerifyEmail.vue`**: migrate tutte le utility color generiche (`text-gray-900`, `bg-green-100`, `bg-blue-800`, ecc.) alle variabili tema `tb-*`. Aggiunto `min-h-screen` al wrapper.
- **Riscritto `NotFound.vue`**: rimosso import di `tailwindplus/NotFoundPage.vue`, sostituito con template inline temizzato (`tb-accent`, `tb-text`, `tb-text-muted`) e `RouterLink` a `/todo`.
- **Spostate 4 route sotto `AppLayout`**: `/verifyemail`, `/premium`, `/user`, `/setting` migrate dai layout `GuestLayout` e `DefaultLayout` in un unico gruppo `AppLayout`.
- **Rimossi `GuestLayout.vue` e `DefaultLayout.vue`**: entrambi non più necessari, tutte le route sotto `AppLayout`.
- **Rimossa `HomePage.vue`**: codice orfano (nessuna route la referenziava, `/` redirige a `/todo`).
- **Rimossa dead code dal router**: `flattenRoutes()` e `flatRoutes` non più usati da nessun file dopo la rimozione dei layout legacy.
- **Fix link About/Contact**: sostituiti `href="#"` con URL reali del repository GitHub (`fdellorso/tobear-vuejs-frontend`). About → repo root, Contact → issues page. Migrate classi da `text-blue-800` a `text-tb-accent`.
- **Fix AGENTS.md**: aggiunto `text` al fenced code block della directory tree (riga 19).
- **Fix ESLint TODO.md**: aggiunto override in `eslint.config.js` che disabilita `markdown/no-missing-label-refs` per `**/TODO.md`.

## Stato attuale

- **Lint**: 1 errore residuo (preesistente) — `PaginationElement.vue:96` variabile `items` inutilizzata. Tutti gli altri 51 errori (markdown) sono stati risolti.
- **Test**: 3 suite, 34 test, tutti passanti.
- **Nessuna nuova modifica API richiesta** — tutto il lavoro è stato lato frontend.
- Il branch `main` è ahead di `origin/main` di 5 commit, con 10 file modificati (59 insertions, 222 deletions).
- I componenti in `src/components/tailwindplus/` sono **tutti orfani** (nessun file li importa più) — rimangono solo `NotFoundPage.vue`, `PaginationElement.vue` (con lint error), `HeaderElement.vue`, `StackedLayout.vue`, `BannerElement.vue`, `CtaSection.vue`, `ContactSection.vue`, `PageHeading.vue`, `DescriptionList.vue`, `DropDownElement.vue`. Da valutare se rimuovere l'intera directory.
- `UserSettings.vue` è temizzato ma **non ha ancora una route nel router** — la route `/setting` è stata spostata sotto `AppLayout` in questa sessione, ma manca il link nella UI (sidebar, FAB). Da verificare se è raggiungibile.
- Bug noto: `MobileNavFab.vue` fa logout senza `withCSRF` (non fixato in questa sessione).

## Decisioni prese

- **Route tutte sotto `AppLayout`**: scelta architetturale per semplificare la gestione dei layout. `AppLayout` gestisce la navigazione responsive (FAB mobile, sidebar desktop) e non ha senso avere layout separati per pagine guest/authenticated quando `AppLayout` già gestisce la visualizzazione condizionale in base allo stato utente.
- **`HomePage.vue` rimossa definitivamente**: non referenziata da nessuna route, `/` redirige direttamente a `/todo`. Se in futuro serve una landing pubblica, va riscritta da zero.
- **Override ESLint per `TODO.md`**: preferito a un `globalIgnores` perché permette di mantenere tutte le altre regole markdown attive su TODO.md, silenziando solo il falso positivo delle label reference (TODO.md usa una sintassi di task list non standard con `[ ]` che il parser markdown interpreta erroneamente come label reference).
- **Link GitHub reali**: inseriti URL del repository pubblico `https://github.com/fdellorso/tobear-vuejs-frontend` in AboutContent e ContactContent, sostituendo i placeholder `href="#"`.

## Prossimi passi

1. **Fix `MobileNavFab.vue` logout senza `withCSRF`** — bug ereditato (stesso di `DesktopSidebar.vue`, già fixato in sessione precedente). Sostituire `axiosClient.post('/logout')` con `withCSRF(() => axiosClient.post('/logout'))`.
2. **Pulire `src/components/tailwindplus/`** — valutare se rimuovere l'intera directory ora che nessun componente è più importato. In caso contrario, almeno fixare/rimuovere `PaginationElement.vue` che dà l'unico errore lint residuo.
3. **TODO.md #16** — UX Desktop hover-reveal buttons (priorità più alta tra le incomplete).
4. **Verificare che `/setting` sia raggiungibile** — la route esiste sotto AppLayout, ma va controllato se c'è un link nella UI (sidebar user menu, FAB).
5. **TODO.md #18 completata**: HomePage.vue rimossa — aggiornare TODO.md spuntando la voce (non fatto automaticamente, chiedere conferma all'utente).

## Note per il backend

- **Nessuna modifica API richiesta** — tutte le modifiche sono frontend-only.
- L'endpoint `PUT /password` per cambio password autenticato è già funzionante (Laravel Breeze standard).
- Il link a `https://github.com/fdellorso/tobear-vuejs-frontend` in About/Contact presuppone che il repository esista ed sia pubblico.

## File rilevanti

- `src/router/index.js` — ristrutturato: rimossi GuestLayout/DefaultLayout, tutte le route sotto AppLayout, rimossa dead code (flattenRoutes/flatRoutes)
- `src/views/GuestLayout.vue` — **eliminato**
- `src/views/DefaultLayout.vue` — **eliminato**
- `src/pages/HomePage.vue` — **eliminato**
- `src/pages/VerifyEmail.vue` — temizzato, aggiunto min-h-screen
- `src/pages/NotFound.vue` — riscritto senza tailwindplus, temizzato
- `src/components/AboutContent.vue` — link GitHub reale + tb-accent
- `src/components/ContactContent.vue` — link GitHub issues reale + hover:opacity-80
- `AGENTS.md` — fix fenced code block language
- `eslint.config.js` — override per TODO.md markdown rule
