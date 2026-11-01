# Handoff — 2026-07-01 — Pulizia header, banner guest, codice commentato e codice morto

## Cosa è stato fatto

### Fix UI (4)
- **AppLayout.vue** — rimosso `<header>` tradizionale (visibile sotto xl, md+). La navigazione è gestita da `MobileNavFab` per mobile/tablet e da `DesktopSidebar` per desktop largo.
- **MobileNavFab.vue** — rimosso `ring-1 ring-white/10` dal PopoverButton; aggiunta voce "Todo" nel popover (prima di About) con navigazione programmatica via `<button>` + `router.push()` e active state detection via `useRoute()`.
- **LogoIcon.vue** — reso condizionale `shadow-xl`: applicato solo quando `noBorder` è `false` (unificato tutto in un unico `:class` dinamico).
- **DesktopSidebar.vue** — aggiunto `:noBorder="true"` al `LogoIcon` (coerente col nuovo comportamento di LogoIcon).

### Fix contenuto (2)
- **TodoPage.vue** — rimosso banner guest "Usi toBear in modalità locale...", rimosso `mode` computed inutilizzato, rimossi 3 blocchi di codice commentato (vecchi `fetchTasks`, `createTask`, `reorderTasks`).
- **UserSettings.vue** — corretto `value="user.mail"` in `:value="user?.email"`.

### Fix layout (1)
- **AppLayout.vue** — grid root cambiato da `xl:min-h-screen` a `xl:h-screen xl:overflow-hidden` per evitare che la colonna destra allunghi la pagina oltre il viewport.

### Fix immagine profilo (1)
- **DefaultLayout.vue** — rimosso `imageUrl` hardcoded (foto Unsplash fittizia) dal computed `userProfile`.
- **StackedLayout.vue** — aggiunto `v-if="user.imageUrl"` sui due `<img>` che usano `user.imageUrl` (header menu e mobile menu), per evitare broken image quando non c'è URL.

### Codice morto (1)
- **ProfileIcon.vue** — eliminato. Il file non era importato da nessun componente attivo del progetto (codice orfano, già segnalato come "da fixare" in TODO.md e handoff precedenti).

## Stato attuale
- **Lint**: 46 errori, tutti pre-esistenti (markdown lint in AGENTS.md/TODO.md, `PaginationElement` unused var) — zero nuovi.
- **Test**: 34/34 passanti (Vitest).
- **AppLayout** pulito: solo sidebar, RouterView, pannello destro optionale e FAB. Nessun `<header>` duplicato.
- **TodoPage** più snella: nessun banner guest, nessun blocco commentato.
- **ProfileIcon.vue** rimosso: la TODO riga 22 ("distinguere guest da authenticated") è ormai superata perché il componente non esiste più.

## Decisioni prese
- **Rimozione header anziché sostituzione**: su mobile/tablet il FAB basta (About, Contatti, auth), su desktop largo la DesktopSidebar gestisce tutto. L'header era un residuo del layout pre-3-colonne.
- **Navigazione programmatica (button) invece di RouterLink per Todo nel FAB**: il RouterLink non navigava correttamente (problema di comportamento con Popover + RouterLink annidato). Sostituito con `<button @click="() => { router.push('/todo'); close() }">`.
- **ProfileIcon eliminato, non fixato**: il componente era orfano da mesi (non importato da nessun layout/pagina). Invece di investire tempo a fixarlo, è stato rimosso. Se servirà un profilo icon dropdown in futuro, va ricreato da zero con le convenzioni attuali.
- **v-if="user.imageUrl" invece di placeholder**: meglio non mostrare nulla che mostrare un'immagine rotta o un placeholder generico. StackedLayout gestisce l'assenza con grazia.

## Prossimi passi
1. **UX Desktop — hover-reveal buttons** per complete/delete (TODO.md riga 15-16) — priorità più alta. Ancora aperto dagli handoff 2026-06-28 e 2026-06-30.
2. **Scrivere test Vitest per TaskItem.vue** (swipe, tap, editing, long-press) — voce aperta da handoff 2026-06-21.
3. **Sync offline batch**: endpoint `POST /v1/tasks/batch-import` (TODO.md riga 28).
4. **TODO.md riga 22** (`ProfileIcon.vue` — non distingue "guest" da "non ancora deciso") — superata: il file è stato rimosso. Valutare se aggiornare TODO.md per rimuovere la voce alla prossima sessione, oppure aggiungere una nuova voce "creare componente profilo utente" se serve.

## Note per il backend
- **Nessuna nuova richiesta API in questa sessione.** Tutti i cambiamenti sono lato frontend.
- Da handoff precedenti: serve ancora `POST /v1/tasks/batch-import` e `POST /v1/contact`.

## File rilevanti
- `src/views/AppLayout.vue` — rimosso header, grid bloccata a viewport
- `src/components/MobileNavFab.vue` — rimosso ring, aggiunta voce Todo con navigazione programmatica
- `src/components/LogoIcon.vue` — shadow condizionale
- `src/components/DesktopSidebar.vue` — noBorder su LogoIcon
- `src/pages/TodoPage.vue` — rimosso banner guest, codice commentato, mode computed
- `src/pages/UserSettings.vue` — fix `user.mail` → `user?.email`
- `src/views/DefaultLayout.vue` — rimosso imageUrl hardcoded
- `src/components/tailwindplus/StackedLayout.vue` — v-if su imageUrl
- `src/components/ProfileIcon.vue` — **eliminato**
