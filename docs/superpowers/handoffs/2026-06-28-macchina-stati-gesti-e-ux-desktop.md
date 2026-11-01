# Handoff — 2026-06-28 — Macchina stati gesti TaskItem + UX desktop + editing inline

## Cosa è stato fatto

### TaskItem.vue — macchina a stati per gesti touch mobile

Implementati tre gesti mutuamente esclusivi sulla stessa area (corpo del task), nessuna gerarchia di fallback:

1. **TAP** (duration < 300ms E spostamento < 10px su entrambi gli assi) → apre editing inline del titolo
2. **SWIPE ORIZZONTALE** (dx > 10px E absDx > absDy) → completa (destra) o elimina (sinistra) — pattern commit-on-release a 35% soglia già esistente, invariato
3. **LONG-PRESS + DRAG** (fermo per 500ms → movimento verticale) → passa il controllo a SortableJS per riordino

Regola fondamentale: ogni gesto che non raggiunge il proprio compimento si annulla senza produrre nessun'altra azione:
- Rilascio tra 300ms e 500ms (zona morta): nessuna azione
- Rilascio dopo movimento oltre soglia: solo l'azione del gesto che ha superato la soglia
- Il click sintetizzato dal browser dopo touchend è soppresso tramite `lastTouchTime` (`Date.now() - lastTouchTime < 1000` in `handleTap`)

Variabili/chiavi della macchina a stati: `startTime`, `wasSwiped`, `lastTouchTime`, `isDragging`.

### TaskItem.vue — editing inline

- Alternanza `<span>` / `<input>` via `v-if="!editing"`
- `beginEdit()`: setta `editing = true`, copia `props.title` in `editTitle`, autofocus via `nextTick`
- `saveEdit()` su blur dell'input: se titolo cambiato e non vuoto → `emit('edit', trimmed)`; se vuoto → ripristina originale (nessuna emit)
- `cancelEdit()` su Escape: chiude editing senza salvare
- Nuovo emit `'edit'` (stringa nuovo titolo)

### TaskItem.vue — template diviso mobile/desktop

- **Mobile**: action panels (`rightAction`, `leftAction`) per swipe, div draggable con `absolute w-full left-0 z-10` e `:style="{ left }"` per l'animazione swipe
- **Desktop**: action panels nascosti via `md:hidden`, div draggable con `relative rounded-lg` (statico, nessuna traslazione). Aggiunti:
  - **Drag handle**: `<span class="hidden md:flex drag-handle">` con 6 pallini SVG, `@mousedown.stop` per non propagare click
  - **Hover overlay**: `<div class="hidden md:flex opacity-0 group-hover:opacity-100 transition-opacity duration-150">` con bottoni Completa (verde, check SVG) e Elimina (rosso, X SVG), entrambi con `@click.stop`
- `isDesktop` calcolato via `window.matchMedia('(hover: hover) and (pointer: fine)')`

### TodoPage.vue — dragOptions, handleEdit

- `dragOptions.delay`: 1200 → **500** (standard iOS/Android per long-press)
- `dragOptions.handle`: condizionale — `'.drag-handle'` su desktop, `undefined` su mobile
- Nuovo `isDesktop` (stessa media query di TaskItem)
- Nuovo `handleEdit(task, newTitle)`: pattern offline-first — trova task in `tasks.value`, aggiorna `original.title`, `saveTask` in IDB, early-return se guest, tentativo `PATCH /v1/tasks/{id}` con `title`
- Binding `@edit` su entrambi i `<TaskItem>` (active tasks nella draggable list + completed tasks nel TransitionGroup)

## Stato attuale

- **✓ Tap-to-edit mobile**: testato via Playwright con touch emulation — tap < 300ms apre editing, blur salva
- **✓ Titolo vuoto su blur**: ripristina il titolo originale (nessuna DELETE, nessuna stringa vuota)
- **✓ Swipe orizzontale**: non interferisce col tap (flag `wasSwiped`), completa/elimina correttamente
- **✓ Long-press 500ms + drag verticale**: SortableJS attiva il drag dopo 500ms, `is-lifted` con vibrate
- **✓ Zona morta 300-500ms**: nessuna azione (né tap, né long-press)
- **✓ Click corpo testo desktop**: apre editing inline
- **✓ Drag handle desktop**: solo la maniglia (6 puntini) attiva SortableJS, click sul corpo apre editing
- **✓ Hover overlay desktop**: check/cestino compaiono con fade 150ms, click esegue l'azione corretta
- **✓ Test Vitest**: 34/34 passati (3 suite: userStore, useTaskDB, useGuestMigration)
- **✓ Lint**: 46 errori pre-esistenti (markdown lint su AGENTS.md/TODO.md, unused var PaginationElement), 0 nuovi
- **✗ Nessun test Vitest per TaskItem o TodoPage** — ancora da scrivere (segnalato in handoff precedenti)
- **Uncommitted**: `TaskItem.vue`, `TodoPage.vue`, `TODO.md` (TODO.md era già stato modificato in sessioni precedenti, non toccato in questa)

## Decisioni prese

- **1000ms come soglia `lastTouchTime` in `handleTap`**: scelta deliberata. Copre lo scenario peggiore (touchstart → touchend a 500ms → click sintetizzato dal browser fino a ~800ms) più 200ms di margine per browser variability. 500ms sarebbe insufficiente — un click emesso a 501ms passerebbe il filtro.
- **Editing interno a TaskItem, non emesso come evento intermedio**: TaskItem gestisce `editing`/`editTitle` internamente ed emette solo `edit` al salvataggio. Coerente con `complete`/`delete` che emettono solo l'azione, non lo stato intermedio.
- **`beginEdit()` chiamata da `releaseSwipe` per tap mobile, non da `handleTap`**: evita la dipendenza dal click sintetizzato del browser. `handleTap` serve solo per click desktop genuini.
- **`wasSwiped` flag**: previene l'apertura dell'editing via click fantasma dopo uno swipe completato. Resettato a ogni `touchstart`.
- **Delay long-press 500ms**: standard iOS/Android (vs 1200ms precedente che era eccessivo). Il rischio di attivazione accidentale è accettato — mitigato dal feedback visivo `is-lifted` (scale + shadow).
- **`(hover: hover) and (pointer: fine)`** come criterio desktop: più accurato del breakpoint `md:` perché funziona correttamente su tablet con tastiera/mouse.

## Prossimi passi (in ordine di priorità)

1. **Scrivere test Vitest per TaskItem.vue** (swipe, tap, editing, long-press) — voce aperta da handoff 2026-06-21, ancora non fatta
2. **ProfileIcon.vue** — distinguere guest da authenticated (handoff 2026-06-28-migrazione-guest-authenticated)
3. **Creare `offline.html`** per `navigateFallback` nel service worker (voce TODO.md "# PWA service worker cache for offline")
4. **Sync offline**: endpoint `POST /v1/tasks/batch-import` per importare task guest con stato completed/deleted in blocco (segnalato in handoff 2026-06-28-migrazione-guest-authenticated)
5. **Commit modifiche in sospeso**: 3 file (`TodoPage.vue`, `TaskItem.vue`, `TODO.md`) — includono modifiche di questa sessione più quelle precedenti non ancora committate

## Note per il backend

- **Nessuna nuova richiesta API in questa sessione**. L'editing usa `PATCH /v1/tasks/{id}` con `title` (endpoint già esistente, già usato per completed).
- Da handoff precedenti: serve ancora `POST /v1/tasks/batch-import` per migrazione task guest.

## File rilevanti

- `src/components/TaskItem.vue` — macchina stati gesti, editing inline, template mobile/desktop, drag handle, hover overlay
- `src/pages/TodoPage.vue` — `dragOptions.delay: 500`, `handle: '.drag-handle'`, `handleEdit()` con offline-first
- `TODO.md` — già strutturato con sezioni da sessioni precedenti, non modificato in questa
- `handoffs/2026-06-28-route-homepage-e-fix-drag-desktop.md` — handoff precedente che rimosse swipe mouse, contesto utile
- `handoffs/2026-06-21-swipe-drag-longpress-e-sezione-completati.md` — implementazione long-press originale (1200ms), swipe migliorato
