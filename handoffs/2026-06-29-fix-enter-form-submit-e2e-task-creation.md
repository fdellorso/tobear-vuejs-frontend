# Handoff — 2026-06-29 — Fix submit nativo su Enter nel form task + test E2E

## Cosa è stato fatto

### Diagnosi e fix: form di creazione task fa full-page refresh su Enter
- **File**: `src/pages/TodoPage.vue`
- **Causa**: `<form>` a riga 65 senza `@submit.prevent`. Premendo Enter in un `<input>` dentro un form HTML nudo, il browser triggera il submit nativo → navigazione vera = full-page reload.
- **Fix**: aggiunto `@submit.prevent="createTask"` al `<form>` (riga 65).
- **Doppio trigger gestito**: con `@blur` e `@submit` entrambi su `createTask`, premendo Enter entrambi gli eventi si attivano in sequenza. Soluzione: `createTask()` ora cattura `title`/`description` in variabili locali e azzera `form` subito prima di qualsiasi `await`. Così la seconda chiamata (da blur) trova `form.title` già vuoto ed esce subito dal guard `if (!title) return`.

### Audit di sicurezza su tutti i `<form>` del progetto
- Ispezionati 11 tag `<form>` in tutto `src/` (file `.vue` e `.html`).
- **Unico form attivo senza `@submit.prevent`**: TodoPage.vue (quello fixato).
- 3 altri form senza protezione (`DropDownElement.vue`, `FormLayout.vue`, `ContactSection.vue`) sono componenti tailwindplus di scaffolding non utilizzati o puramente dimostrativi.
- **LoginPage.vue confermato safe**: non ha un `<form>` diretto — usa `<SignInPage>` (tailwindplus) che ha `<form @submit.prevent>`.

### Nuovo test E2E Playwright
- **File**: `e2e/todo-task-enter.spec.js`
- Testa che premendo Enter sull'input "Titolo del task" il task venga creato **senza** full-page reload (stessa tecnica `window.__appLoaded` del test `spa-navigation.spec.js`).
- Verifica anche che il testo del task sia visibile nella lista.

### Altri test
- `npm run test` (Vitest): 34/34 pass — nessuna regressione.
- `npm run test:e2e`: 2/2 pass (spa-navigation + todo-task-enter).
- `npm run lint`: 0 nuovi errori (46 pre-esistenti invariati).

## Stato attuale
- **Tutto funzionante**. Il bug del full-page reload su Enter è risolto.
- I form attivi di login, register, contatti, settings, upload hanno tutti `@submit.prevent` — nessun altro rischio reload nativo.
- `e2e/todo-task-enter.spec.js` è da includere nell'esecuzione E2E routine (fa già parte della suite `npm run test:e2e`).

## Decisioni prese
- **`createTask()` refactoring**: spostare la lettura di `title`/`description` in cima e pulire `form` subito invece che dopo le chiamate API. Oltre a risolvere il doppio trigger, questo è un pattern più robusto: il form viene liberato immediatamente, l'utente vede il feedback ottico prima che la richiesta HTTP sia completata. Pattern raccomandato per futuri form con submit+blur.
- **`@submit.prevent` preferito a `@keydown.enter.prevent`**: protezione più completa (copre anche eventuali futuri `<button type="submit">`). Coerente con tutti gli altri form del progetto.

## Prossimi passi
1. **UX Desktop — hover-reveal buttons** per complete/delete (TODO.md riga 15-16) — sostituisce swipe mouse rimosso. Voce aperta da handoff 2026-06-28.
2. **Scrivere test Vitest per TaskItem.vue** (swipe, tap, editing, long-press) — voce aperta da handoff 2026-06-21.
3. **ProfileIcon.vue** — distinguere guest da authenticated (TODO.md riga 22).
4. **Sync offline batch**: endpoint `POST /v1/tasks/batch-import` (da handoff precedenti, TODO.md riga 28).
5. **Considerare commit** delle modifiche correnti: `src/pages/TodoPage.vue` (modificato) e `e2e/todo-task-enter.spec.js` (nuovo).

Nessuna nuova voce in TODO.md da aggiungere — il bug fixato non era elencato, il test E2E aggiunto è un'estensione della suite già coperta dal test esistente.

## Note per il backend
- **Nessuna nuova richiesta API in questa sessione**. Tutti i cambiamenti sono lato frontend.
- Da handoff precedenti: serve ancora `POST /v1/tasks/batch-import` e `POST /v1/contact`.

## File rilevanti
- `src/pages/TodoPage.vue` — fix `<form @submit.prevent>` + refactoring `createTask()`
- `e2e/todo-task-enter.spec.js` — **nuovo**: test E2E per creazione task con Enter
