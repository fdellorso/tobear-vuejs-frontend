# Handoff — 2026-06-28 — Route / → /todo + fix drag desktop

## Cosa è stato fatto

### 1. Route `/` ora redirect a `/todo` (`src/router/index.js`)
- Aggiunta route `{ path: '/', redirect: '/todo' }` come prima entry nell'array `routes`
- Rimossa la child route `Home` (con `component: HomePage`) dal parent `GuestLayout`
- Rimosso `import HomePage` (il file `HomePage.vue` resta su disco, codice in pausa)
- `GuestLayout` serve ancora `/login`, `/register`, `/verifyemail`, `/premium`, `/about`, `/contact`

### 2. Diagnostica drag desktop (`src/components/TaskItem.vue`)
- **Bug**: drag&drop via mouse per riordinare i task non funzionava più dal commit che introdusse `delay: 1200, delayOnTouchOnly: true, touchStartThreshold: 10` e il callback `move: () => !isHorizontalDragging.value` nelle `dragOptions`.
- **Diagnosi**: `startDrag` (mouse handler in TaskItem) emetteva `horizontal-dragging = true` immediatamente al `mousedown`, facendo sì che il callback `move` di SortableJS restituisse sempre `false`, bloccando ogni riordino col mouse. Su touch il conflitto non esiste perché SortableJS ha un delay di 1200ms che dà tempo a TaskItem di decidere la direzione prima che SortableJS inizi il drag.
- **Tentativo fallito**: replicare la logica di soglia (10px) anche su mouse. Non risolve perché SortableJS parte immediatamente su mouse (`delayOnTouchOnly: true`), crea ghost e `display:none` dell'originale, inquinando gli eventi mousemove successivi (clientX si blocca alle coordinate originali). Vedi diagnostica completa nel report a inizio sessione.

### 3. Fix: rimozione swipe mouse da TaskItem.vue
- Rimosso `@mousedown="startDrag"` dal template
- Rimosse le funzioni `startDrag`, `onDrag`, `stopDrag`
- Rimossi i `removeEventListener('mousemove', onDrag)` e `removeEventListener('mouseup', stopDrag)` da `releaseSwipe` e `onBeforeUnmount`
- **Intatta**: logica touch (`startDragTouch` → `onDragTouch` → `stopDragTouch` → `releaseSwipe`)
- **Intatto**: watcher `dragActive` che rimuove listener touch quando SortableJS attiva il drag (long-press mobile)
- **Niente memory leak**: nessun listener mouse orfano, nessun riferimento pendente a funzioni rimosse

## Stato attuale
- **✓ Route `/` → redirect a `/todo`**: testato via Playwright, atterra su `/todo` sia per guest che authenticated
- **✓ Drag verticale (riordino) col mouse**: funzionante. Testato Playwright con 3 task, drag lento verticale: ordine cambiato correttamente
- **✓ Swipe orizzontale touch**: funzionante. Testato Playwright con emulazione touch, task completato spostato in sezione completati
- **✓ Click senza movimento**: non produce effetti collaterali
- **✗ Swipe orizzontale col mouse**: rimosso deliberatamente (conflitto strutturale con SortableJS). Sarà sostituito in futuro da hover-reveal buttons (vedi "Prossimi passi")
- **Lint**: 18 errori pre-esistenti (markdown lint su AGENTS.md/TODO.md, unused var in PaginationElement.vue) — 0 nuovi
- **Test**: 34/34 passati (3 suite: userStore, useGuestMigration, useTaskDB)
- **Uncommitted**: 2 file modificati (`TaskItem.vue`, `router/index.js`)

## Decisioni prese
- **Redirect statt restructure**: `/` → `redirect: '/todo'` è più pulito che riassegnare layout. La route `/` non ha layout proprio, rimanda direttamente a `/todo` che è sotto `AppLayout` (layout condizionale guest/authenticated già funzionante dalle sessioni precedenti). Nessun impatto sul guard del router: la redirect è puramente lato route definition.
- **HomePage.vue in pausa, non cancellato**: il file esiste ancora su disco, nessuna route lo referenzia. Potrà essere riattivato per un futuro marketing/public landing quando il prodotto sarà più maturo.
- **Swipe mouse rimosso, non "soglia"**: la logica di soglia che funziona per touch (10px dx/dy) non è replicabile su mouse perché SortableJS parte immediatamente e le sue manipolazioni DOM (ghost, `display:none`) interferiscono con gli eventi. Su touch il delay di 1200ms dà la finestra temporale necessaria. Non c'è fix incrementale — serve una riprogettazione di come le azioni complete/delete vengono gestite su desktop (hover-reveal buttons, non swipe).
- **Primo avvio MVP**: l'URL principale `/` ora porta direttamente alla todo list funzionante. Non c'è più una landing page di marketing. Questo è lo stato desiderato per l'MVP.

## Prossimi passi (in ordine di priorità)
1. **Hover-reveal buttons su desktop**: implementare bottoni Complete/Delete che appaiono al passaggio del mouse su TaskItem (sostituiscono lo swipe mouse rimosso). Pattern comune: icon buttons che appaiono in hover con transizione opacity.
2. **Commit modifiche in sospeso**: 2 file da committare (`router/index.js`, `TaskItem.vue`) — includono modifiche di questa sessione più la route redirect della sessione precedente (non ancora committata).
3. **ProfileIcon.vue** (da handoff precedente): aggiornare per distinguere tra guest e authenticated. Oggi mostra login in `v-else`.
4. **Sync offline**: fix noto per task con `localOnly` + `pendingComplete`/`pendingDelete` — serve un endpoint `POST /v1/tasks/batch-import` sul backend per importare task guest con stato completed/deleted in blocco dopo login (segnalato in handoff 2026-06-28-migrazione-guest-authenticated.md).
5. **PWA offline**: creare `offline.html` per `navigateFallback` nel service worker (voce TODO.md "PWA service worker cache for offline").
6. **Test Vitest per componenti Vue**: TaskItem swipe, TodoPage offline pattern (segnalato in handoff precedenti).

## Note per il backend
Nessuna nuova richiesta in questa sessione. Il fix del drag non richiede API backend.

Da handoff precedenti: serve ancora `POST /v1/tasks/batch-import` per la migrazione di task guest con stato completed/deleted.

## File rilevanti
- `src/router/index.js` — route `/` → redirect a `/todo`, HomePage non più referenziata
- `src/components/TaskItem.vue` — rimosso swipe mouse (`startDrag`/`onDrag`/`stopDrag`), intatta logica touch
- `src/pages/HomePage.vue` — non modificato, ma non più referenziato da nessuna route
