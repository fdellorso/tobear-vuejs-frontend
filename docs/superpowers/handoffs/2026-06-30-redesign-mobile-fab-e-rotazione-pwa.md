# Handoff — 2026-06-30 — Redesign mobile: FAB navigazione + blocco rotazione PWA

## Cosa è stato fatto

### Nuovo componente MobileNavFab.vue
- Creato `src/components/MobileNavFab.vue` — FAB (floating action button) fisso in basso a sinistra su mobile, con logo toBear come icona.
- Al tap si apre un popover Headless UI (`Popover` + `PopoverButton` + `PopoverPanel`) ancorato al FAB, che si apre verso l'alto.
- Contenuto del popover:
  - Link a About e Contatti (sempre visibili)
  - Se `mode === 'guest'`: testo "Modalità locale — crea un account per sincronizzare i task." + link Accedi e Registrati
  - Se `mode === 'authenticated'`: nome utente (testo) + pulsante Esci (logout)
  - Premium **non** appare nel popover
- Chiusura: click fuori (Headless UI nativo) + `@click="close"` su ogni link/azione.
- Visibile solo su mobile (`md:hidden`).

### Modifiche ad AppLayout.vue
- `<header>` ora ha `hidden md:block` — nascosto su mobile (<768px), visibile su desktop come prima.
- `<main>` ora ha `pb-20 md:pb-0` — 80px di padding inferiore su mobile per evitare sovrapposizione dell'ultimo task col FAB fisso.
- Importato e montato `<MobileNavFab />` dopo `</main>`.

### Prop noBorder su LogoIcon.vue
- Aggiunto prop opzionale `noBorder` (boolean, default `false`).
- Il `border-2 border-amber-900` (bordo ambrato scuro) ora è condizionale via `:class`.
- Usato in MobileNavFab.vue con `:noBorder="true"` per un FAB pulito senza bordo.
- Gli altri usi (AppLayout header, GuestLayout, DefaultLayout, HomePage) restano invariati (bordo presente).

### Banner "modalità locale" — spostato in popover su mobile
- TodoPage.vue: il banner guest ora ha `hidden md:block` — nascosto su mobile (sostituito dal popover), visibile su desktop come prima.
- MobileNavFab.vue: aggiunto testo "Modalità locale — crea un account per sincronizzare i task." sopra i link Accedi/Registrati, solo in modalità guest.

### Blocco orientamento schermo per PWA
- Verificato: tutti i manifest (manifest.webmanifest, dev.manifest.webmanifest, prod_x10, prod_if) già contengono `"orientation": "portrait"` — nessuna modifica necessaria.
- Aggiunto blocco programmatico in `src/main.js`: `screen.orientation?.lock?.('portrait')` chiamato solo quando `navigator.standalone` (iOS) o `matchMedia('(display-mode: standalone)')` (Android) rilevano PWA installata.
- Avvolto in try/catch — l'API non è supportata su iOS Safari PWA (Apple non implementa `screen.orientation.lock`). Il manifest hint è l'unico controllo su iOS. Comportamento documentato come limite noto, non bug.

## Stato attuale

- **Mobile (<md)**: header nascosto, FAB + popoper attivo con navigazione completa. Banner guest spostato nel popover. La TodoPage (lista task, swipe, drag, editing) **non è stata toccata**.
- **Desktop (md+)**: tutto invariato — header visibile, banner guest in pagina, nessun FAB.
- **PWA**: orientation lock tenta lock programmatico in standalone; su iOS fallisce silenziosamente (limite noto).
- **Lint**: 47 errori pre-esistenti invariati (markdown lint in AGENTS.md, TODO.md, MATOMO.md + PaginationElement unused var) — zero nuovi errori dalle nostre modifiche.
- **Test**: nessun test scritto/modificato in questa sessione. I test E2E esistenti (spa-navigation, todo-task-enter) dovrebbero continuare a passare perché le route e i link di navigazione non sono cambiati — ma il test `todo-task-enter.spec.js` potrebbe risentire del banner guest spostato (controllare se interagisce col banner). Da verificare.

## Decisioni prese

- **Breakpoint mobile/desktop**: `md` (768px), coerente con TaskItem.vue che già usa `md:hidden` / `hidden md:flex` per mobile/desktop split. Non `lg` come usato in alcuni componenti tailwindplus — `md` è la convenzione attuale nel codice applicativo.
- **Popover vs bottom-sheet**: scelto Popover Headless UI ancorato al FAB (non modale, non bottom-sheet) perché richiesto esplicitamente e perché è il pattern giusto per un menu di navigazione con poche voci.
- **Prop `noBorder` su LogoIcon**: preferito a override CSS scoped perché più esplicito e manutenibile. Il bordo ambrato è parte dell'identità visiva del logo negli header, ma in un FAB minimalista è un elemento visivo di troppo.
- **FAB vs padding lista**: scelto `pb-20` sul `<main>` di AppLayout (non su TodoPage) perché il padding è responsabilità del layout che ospita il FAB. Se in futuro TodoPage viene riusato in un altro layout senza FAB, non avrà padding extra inutile.
- **Banner guest desktop**: mantenuto in TodoPage via `hidden md:block`, non rimosso completamente. Su desktop l'header non ha il testo esplicativo "sincronizzare i task", e il banner serve ancora come CTA per utenti guest.
- **Screen orientation lock**: tentativo programmatico solo in standalone PWA, non nel browser normale. API non supportata su iOS — documentato ma non inseguito.

## Prossimi passi

1. **UX Desktop — hover-reveal buttons** per complete/delete (TODO.md riga 15-16) — voce aperta da handoff 2026-06-28. È la prossima feature più importante per la parità mobile/desktop.
2. **Scrivere test Vitest per TaskItem.vue** (swipe, tap, editing, long-press) — voce aperta da handoff 2026-06-21.
3. **ProfileIcon.vue** — distinguere guest da authenticated (TODO.md riga 22, handoff 2026-06-29).
4. **Sync offline batch**: endpoint `POST /v1/tasks/batch-import` (da handoff precedenti, TODO.md riga 28).
5. **Verificare test E2E** dopo lo spostamento del banner guest — `todo-task-enter.spec.js` potrebbe interagire col banner.
6. **Redesign desktop header** (sessione separata, annunciata nelle specifiche di questo FAB — l'header desktop non è stato toccato).

Nessuna nuova voce in TODO.md da aggiungere — le modifiche di questa sessione (FAB mobile, orientation lock) non erano elencate.

## Note per il backend

- **Nessuna nuova richiesta API in questa sessione**. Tutti i cambiamenti sono lato frontend.
- Da handoff precedenti: serve ancora `POST /v1/tasks/batch-import` e `POST /v1/contact`.

## File rilevanti

- `src/components/MobileNavFab.vue` — **nuovo**: FAB + Popover navigazione mobile
- `src/views/AppLayout.vue` — header hidden su mobile, padding per FAB, import MobileNavFab
- `src/components/LogoIcon.vue` — aggiunto prop `noBorder`
- `src/pages/TodoPage.vue` — banner guest `hidden md:block` (solo mobile nascosto)
- `src/main.js` — blocco orientamento PWA standalone
