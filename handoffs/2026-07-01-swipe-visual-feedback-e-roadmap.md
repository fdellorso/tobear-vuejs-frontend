# Handoff — 2026-07-01 — Swipe visual feedback, roadmap e refactor AGENTS.md

## Cosa è stato fatto

### TaskItem.vue — swipe mobile rifatto (3 sessioni di modifica)
- **Template**: rimosse le due strip `leftAction`/`rightAction` (verde/rosso al 50% di opacità) e sostituite con un unico `div` full-cover (`inset-0`) con due span ai lati, opacità 0 iniziale.
- **Nuovo ref `swipeAction`** — singolo div che copre l'intero container, background-color dinamico in base a direzione e stato `completed`.
- **Colore condizionale**: swipe destra → verde (`#22c55e`) per task attivo, arancione (`#f97316`) per task completato (reinserisci). Swipe sinistra → rosso (`#ef4444`) sempre.
- **Direzione swipe tracciata**: nuovo ref `swipeDirection` (0/1/-1). Gli span nel template usano `v-show="swipeDirection === 1"` e `v-show="swipeDirection === -1"` — si vede solo la label pertinente.
- **Allineamento label**: il div `swipeAction` usa `:class="swipeDirection === -1 ? 'justify-end' : 'justify-start'"` così "Elimina" sta a destra e "Completa"/"Reinserisci" a sinistra, anche quando l'altro span è nascosto.
- **Reset**: `swipeDirection` reso a 0 nei due punti di reset in `releaseSwipe` (setTimeout e else).
- **Import `computed`** aggiunto a `vue`.

### TodoPage.vue — fix ghosting mobile dopo reorder
- Entrambi i punti in `reorderTasks()` (ramo guest e ramo authenticated) dove si faceva `tasks.value = await getAllTasks()` ora filtrano `!t.pendingDelete` per evitare che task marcati per eliminazione riappaiano dopo il riordino.

### AGENTS.md — nuova sezione Layout e regola codice commentato
- Aggiunta sezione "Layout e navigazione" dopo "Architettura" — documenta la struttura responsive (mobile FAB, tablet FAB, desktop 3 colonne), le route per layout e il comportamento speciale del pannello destro su xl+.
- Sostituita la vecchia regola "Codice commentato" (che tollerava blocchi commentati come storico) con la regola più netta: "Non lasciare blocchi di codice commentato nel codebase — il codice morto va rimosso. Se serve storico, esiste git."

### TODO.md — roadmap
- Aggiunta sezione "## Visione e roadmap" in fondo (77 righe): filosofia del prodotto, infrastruttura target, moduli pianificati, business plan, funzionalità future ordinate per priorità, architettura dati pendente, e note pre-sync.
- Aggiunto "Mantra zero attriti" sotto "Filosofia del prodotto".

## Stato attuale

- **Swipe mobile**: feedback visivo molto migliorato — singolo background full-color che si accende progressivamente, label pertinente visibile solo nella direzione di swipe, colore coerente con stato completato (arancione per reinserisci). Reset pulito dopo azione.
- **Reorder ghosting fixato**: i task con `pendingDelete` non riappaiono più dopo il riordino, né in modalità guest né autenticata.
- **AGENTS.md**: aggiornato e allineato allo stato attuale dell'app (layout responsive a 3 colonne, nessun header).
- **TODO.md**: roadmap completa aggiunta. Le checklist esistenti non sono state modificate (nessun item segnato come completato).
- **Lint**: zero nuovi errori (52 pre-esistenti — markdown lint in AGENTS.md/TODO.md, unused var in PaginationElement.vue).

## Decisioni prese

- **Singolo div swipe invece di due span separati**: semplifica la gestione del colore di sfondo (unico elemento, colore dinamico via JS). `inset-0` copre l'intero container, non serve più calcolare metà larghezza.
- **Background full-color invece di strip semi-trasparenti**: l'opacità parte da 0 (invisibile) e arriva a 1 (pieno colore) a swipe completo — feedback più immediato e "clean" nello stile Clear.
- **Label condizionale via `v-show`**: solo la label corrispondente alla direzione è visibile, evitando confusione (prima si vedevano entrambe "Completed" e "Delete", sbiadite).
- **`justify-end` / `justify-start` dinamico**: risolve l'allineamento senza rompere il layout flessibile quando uno span è hidden.
- **Zero attriti come mantra**: registrato in TODO.md come principio guida per future decisioni UX.

## Prossimi passi

1. **TODO.md #15-16** (UX Desktop hover-reveal buttons) — ancora la priorità più alta aperta. Il bottone complete/delete esiste ma va verificata completezza.
2. **TODO.md #18** (HomePage.vue) — decidere se recuperare o rimuovere.
3. **Scrivere test Vitest per TaskItem.vue** (swipe, tap, editing, long-press) — voce aperta da handoff 2026-06-21.
4. **Sync offline batch**: endpoint `POST /v1/tasks/batch-import` (TODO.md #28).
5. **TODO.md voce #22** (`ProfileIcon.vue`) — superato, il file è stato rimosso in handoff precedente. Segnare come completato o rimuovere.

## Note per il backend

- Nessuna nuova richiesta in questa sessione.
- TODO.md #28: serve ancora `POST /v1/tasks/batch-import` per sync offline batch.

## File rilevanti

- `src/components/TaskItem.vue` — swipe feedback rifatto, direzione tracciata, label condizionali
- `src/pages/TodoPage.vue` — filtro `pendingDelete` in reorderTasks
- `AGENTS.md` — nuova sezione Layout e navigazione, regola codice commentato
- `TODO.md` — aggiunta sezione Visione e roadmap + Mantra zero attriti
