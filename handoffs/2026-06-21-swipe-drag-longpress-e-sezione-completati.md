# Handoff — 2026-06-21 — Swipe, drag long-press e sezione completati

## Cosa è stato fatto

### 1. Sezione "Completati" separata con animazione (`src/pages/TodoPage.vue`)
- Template diviso in due liste: **attivi** (vuedraggable, riordinabili) e **completati** (TransitionGroup statico, non draggable)
- Nuovo header "Completati" con stile uppercase tracking-wider tra le due sezioni
- Computed `activeTasks` (ref filtrata manualmente) e `completedTasks` (computed, sola lettura)
- Funzione `rebuildActiveTasks()` chiamata dopo ogni mutazione (fetch, create, complete, delete, reorder)
- TransitionGroup con animazioni FLIP: `completed-enter-active` con delay 0.2s per dare tempo al leave dell'item dalla lista attivi
- `flip-list-leave-active/leave-to` e `completed-enter-from`/`leave-to` cross-coordinate

### 2. Swipe azione solo al rilascio, stile Clear (`src/components/TaskItem.vue`)
- **Prima**: `emit('complete')`/`emit('delete')` scattava durante il touchmove non appena la soglia veniva superata
- **Dopo**: azione solo al rilascio (`touchend`/`mouseup`) in `releaseSwipe()`:
  - Oltre soglia → anima `left` a `±containerWidth` (fuori schermo), dopo 350ms `emit(action)`
  - Entro soglia → anima `left` a 0 (rientro), nessuna azione
- Soglia aumentata al **35%** della larghezza dell'elemento (era 30%)
- Opacità pannelli azione **progressiva** (`0.5 + ratio * 0.5`) invece di binaria 0.5/1.0
- Logica estratta in `handleSwipe(dx)` e `releaseSwipe()`, condivisa tra mouse e touch
- Mouse handler `onDrag` delegato a `handleSwipe(dx)`
- Rimosso `dataset.triggered` (non più necessario)
- `@touchstart.prevent` → `@touchstart` (non bloccavamo più lo scroll prematuramente)

### 3. Long-press per attivare drag su mobile
- `dragOptions` in TodoPage: `delay: 1200, delayOnTouchOnly: true, touchStartThreshold: 10`
- SortableJS delay gestisce il timing (1200ms), si auto-cancella se il dito supera 10px in qualsiasi direzione
- TaskItem riceve `:drag-active="drag"` come prop e reagisce via watcher:
  - `dragActive = true` → `navigator.vibrate?.(50)` + classe `.is-lifted` (scale 1.03 + shadow) + rimozione listener touch (cede il controllo a SortableJS)
  - `dragActive = false` → rimuove `.is-lifted`
- Durante il delay (1200ms): TaskItem traccia dx/dy per decidere se è swipe orizzontale (>10px, più orizzontale che verticale), scroll verticale (>10px verticale), o nessuno dei due (aspetta che SortableJS attivi il drag)
- Desktop (mouse) invariato: drag immediato, senza delay

### 4. Feedback haptic
- `navigator.vibrate?.(50)` su completamento task (in `handleComplete`)
- `navigator.vibrate?.(50)` su attivazione drag (nel watcher `dragActive`)

### 5. Animazioni `is-lifted` e `flip-list/completed`
- Classe `.is-lifted` in `TaskItem.vue`: `scale(1.03)`, `box-shadow: 0 8px 24px`, `transition: 0.15s`, `z-index: 100`
- Transizioni `flip-list-move` (0.5s), `flip-list-leave` (0.3s), `completed-enter` (0.4s con 0.2s delay), `completed-leave` (0.3s)

### 6. Altre modifiche minori
- Evento `@end` su vuedraggable spostato in handler esplicito `onDragEnd` (era inline)
- `stopDragTouch` e `stopDrag` ora chiamano `releaseSwipe()` invece di avere logica duplicata

## Stato attuale

- **Swipe (complete/delete)**: funzionante su touch e mouse. Azione solo al rilascio, con animazione fuori schermo. Opacità progressiva. Testato in headless Chromium con touch emulation (swipe rapido → complete ok; long-press → SortableJS non interferisce).
- **Drag reorder**: su mobile si attiva dopo 1200ms di pressione senza movimento (long-press), con feedback haptico e visivo. Su desktop drag immediato.
- **Sezione completati**: task completati appaiono in sezione separata con animazione. Ri-entrano tra gli attivi con la stessa fluidità se decompletati.
- **Test Vitest**: 15 test, tutti verdi (useTaskDB, userStore). Nessun test per i componenti Vue (TaskItem swipe, TodoPage offline pattern).
- **Lint**: 38 errori pre-esistenti (markdown lint, e2e-test.mjs, PaginationElement.vue), nessun errore nuovo.
- **Modifiche non committate**: `src/components/TaskItem.vue`, `src/pages/TodoPage.vue`, `vite.config.js` (quest'ultimo preesistente da sessione precedente — http:3001, mkcert commentato).

## Decisioni prese

- **1200ms come delay del long-press**: standard iOS per azioni contestuali (es. modalità editing Mail). Abbastanza lungo da non interferire con tap/swipe, abbastanza breve da non sembrare "bloccato".
- **`delayOnTouchOnly: true`**: il delay si applica solo a touch, non a mouse — su desktop il drag è immediato com'era prima.
- **`touchStartThreshold: 10`**: SortableJS auto-cancella il drag ritardato se il dito si muove oltre 10px in qualsiasi direzione. Questo gestisce automaticamente sia lo swipe orizzontale (che TaskItem intercetta) sia lo scroll verticale (che annulla il long-press).
- **Soglia swipe al 35%**: bilancia accessibilità (soglia troppo alta richiede swipe lunghi) e prevenzione falsi positivi.
- **350ms di animazione off-screen prima dell'emit**: tempo sufficiente per la `transition: all 0.3s` del CSS, dà feedback visivo che l'azione è avvenuta prima che l'item scompaia.
- **No drag sui completati**: scelta deliberata. I completati sono in una lista separata non draggable.
- **Opacità progressiva invece di binaria**: feedback più naturale, l'utente vede il pannello azione illuminarsi gradualmente man mano che spinge oltre.

## Prossimi passi

1. **Test E2E su swipe/drag** con Playwright su mobile emulato: verificare che:
   - Swipe rapido completi/deleti il task
   - Long-press 1.5s attivi il drag (con feedback visivo)
   - Scroll verticale annulli il long-press
   - Mouse desktop faccia drag immediato
2. **PWA offline**: creare `offline.html` per `navigateFallback` nel service worker (workbox), testare comportamento offline disconnettendo la rete
3. **TODO.md**: nessuna voce è stata completata in questa sessione. Le feature implementate (swipe migliorato, sezione completati, long-press drag) non avevano voci esplicite in TODO.md. Valutare se aggiungerle.
4. **Test Vitest per componenti Vue**: TaskItem (swipe, drag), TodoPage (offline-first pattern) — sarebbero il prossimo passo logico ora che Vitest è configurato.
5. **Sync offline senza lock**: `syncLocalTasks` non gestisce fallimenti parziali (preesistente, segnalato in handoff precedenti).

## Note per il backend

Nessuna nuova richiesta API in questa sessione. Il reorder usa già `PATCH /v1/tasks/reorder`, il completamento usa `PATCH /v1/tasks/{id}`. Nessun nuovo campo o endpoint richiesto.

## File rilevanti

- `src/components/TaskItem.vue` — swipe gesture, long-press detection, releaseSwipe, handleSwipe, dragActive watcher, `.is-lifted` CSS
- `src/pages/TodoPage.vue` — split template attivi/completati, activeTasks/completedTasks, rebuildActiveTasks, dragOptions con delay, onDragEnd, handleComplete con vibrate, CSS animazioni TransitionGroup
