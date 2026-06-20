# Handoff — 2026-06-20 — Integrazione TaskItem + offline reorder

## Cosa è stato fatto

### FASE 1 — Integrazione TaskItem in TodoPage

- **TaskItem.vue**: scambiati gli emit `complete` e `delete` per allinearli con le etichette visive. PRIMA: swipe sinistra (mostra "Delete") emetteva `complete` e swipe destra (mostra "Completed") emetteva `delete`. DOPO: swipe sinistra → `emit('delete')`, swipe destra → `emit('complete')`. Il fix è stato applicato in entrambi i gestori `onDrag` (mouse) e `onDragTouch` (touch).
- **TodoPage.vue**: scommentato e integrato il componente `<TaskItem>` nel template del `draggable`, con `@complete`, `@delete`, `@horizontal-dragging` collegati agli handler reali.
- **Aggiunti `handleComplete` e `handleDelete`**: seguono il pattern offline-first (aggiornamento ottimistico → IndexedDB → tentativo API → fallback con flag `pendingComplete`/`pendingDelete`).
- **Endpoint `complete`**: corretto da `PATCH /v1/tasks/{id}/complete` (inesistente) a `PATCH /v1/tasks/{id}` con body `{ completed: task.completed }`. Il backend `UpdateTaskRequest` già accetta il campo `completed` come `sometimes|boolean` — verificato su `backend/app/Http/Requests/UpdateTaskRequest.php`.
- **`useTaskDB.js`**: aggiunta funzione `deleteTask(id)`.
- **`syncLocalTasks` estesa**: ora gestisce anche `pendingDelete` (DELETE API + rimozione da IDB) e `pendingComplete` (PATCH con `{ completed }` + rimozione flag), prima del blocco creazioni (`localOnly`) esistente.
- **`fetchTasks` catch**: ora filtra `tasks.value` escludendo i task con `pendingDelete: true` caricati da IndexedDB.
- **`onMounted`**: ora chiama `syncLocalTasks()` prima di `fetchTasks()` per garantire che eventuali task pendenti (create/delete/complete) vengano processati al refresh di pagina.
- **Conflitto drag vs swipe**: già gestito — vuedraggable ha `move: () => !isHorizontalDragging.value`, e TaskItem emette `horizontal-dragging(true/false)` all'inizio/fine dello swipe.

### FASE 2 — Fallback offline per reorder

- **`reorderTasks`**: ora salva l'ordine in IndexedDB anche quando la chiamata API fallisce (prima il salvataggio era solo nel try). Inoltre salva un flag `pendingReorder` in IndexedDB (non più localStorage) tramite una entry dedicata `__pending_reorder__`.
- **`useTaskDB.js`**: aggiunte 3 funzioni `savePendingReorder`, `getPendingReorder`, `clearPendingReorder` che usano una entry con ID riservato `__pending_reorder__` nello stesso object store 'tasks'. `getAllTasks` ora filtra via questa entry per non restituirla come falso task.
- **`onMounted`**: ora controlla `getPendingReorder()` prima di `fetchTasks()` per sincronizzare l'ordine col backend appena possibile. Se il sync fallisce (offline), il flag resta in IDB per il prossimo tentativo.
- **Online listener**: esteso con retry del pendingReorder via `getPendingReorder()` + `PATCH /v1/tasks/reorder` quando si torna online.

### Investigazione 500 login

- Verificato che il backend è attivo su port 8000 via herd-lite (`php -S 0.0.0.0:8000`).
- **Fix EncryptCookies ancora presente**: `bootstrap/app.php` non ha `EncryptCookies` nell'`api` group. Solo nella sub-pipeline Sanctum (`config/sanctum.php`). Il fix della sessione precedente è intatto.
- **Test curl diretto**: `POST /api/login` → 204 ✅, `GET /api/user` → 409 "email not verified" ✅ (comportamento atteso per utente non verificato).
- **Conclusione**: il 500 visto nel test Playwright non era dell'API login ma del catch-all web route (`routes/web.php:38`) che prova a servire `public/app/index.html` inesistente.

## Stato attuale

- **TaskItem + swipe**: integrato e funzionante. Swipe destra → completa task, swipe sinistra → elimina. Entrambi supportano offline-first con retry.
- **Reorder offline**: ordine salvato in IDB anche offline; retry automatico al ritorno online (via flag `__pending_reorder__` in IDB).
- **Pattern offline unificato**: ora `localOnly` (creazione), `pendingDelete` (eliminazione), `pendingComplete` (completamento), `__pending_reorder__` (riordino) usano tutti IndexedDB tramite `useTaskDB.js`. Nessun uso di `localStorage`.
- **Login/API**: funzionante via `laravel.fritz.box:8000`, session cookie-based con Sanctum. L'endpoint `PATCH /v1/tasks/{id}` con `completed` è supportato dal backend esistente.
- **Lint**: rotto a livello di configurazione ESLint (crash su file `.json`/`.md` in `.opencode/`). I file modificati passano senza errori.
- **TODO.md**: voci "TaskItem frontend component", "completed api operation", "delete api operation" sono state completate in questa sessione.

## Decisioni prese

- **Emit scambiati in TaskItem**: era un bug preesistente. Swipe sinistra mostrava "Delete" ma emetteva `complete`; swipe destra mostrava "Completed" ma emetteva `delete`. Corretto per allineare etichette visive e comportamento.
- **`PATCH /v1/tasks/{id}/complete` non esiste**: usato `PATCH /v1/tasks/{id}` con `{ completed: boolean }` — già supportato da `UpdateTaskRequest`.
- **Pending reorder in IndexedDB con entry dedicata**: scelto per coerenza col resto del pattern offline (tutto in IDB, nessun `localStorage`). La entry `__pending_reorder__` è filtrata da `getAllTasks()` per non apparire come task UI. Non si usa un campo `pendingReorder: true` su ogni task perché semanticamente scorretto (un reorder riguarda l'intera lista, non singoli task).
- **Sync riordino prima di `fetchTasks` in `onMounted`**: per evitare che `clearTasks()` di `fetchTasks` cancelli il flag `__pending_reorder__` prima che venga processato.

## Prossimi passi

1. **Fixare lint** — installare `@eslint/json` e configurare ESLint per escludere `.opencode/` dai file processati, o aggiornare `eslint.config.js` per scoping corretto delle regole.
2. **Service worker navigateFallback** — verificare o creare `offline.html` per `navigateFallback: '/offline.html'` in `vite.config.js`.
3. **Sync locale senza lock** — `syncLocalTasks` non gestisce fallimenti parziali. Un approccio a coda sarebbe più robusto.
4. **Collegare pagine image al router** — `MyImages`, `MyAlbums`, `UpLoad`, `ReSize` sono corretti ma scollegati dal router (feature pianificata fase 2 immagini come todo).
5. **Verificare `DELETE /v1/images/{id}` e `DELETE /v1/albums/{id}`** — implementazione backend già presente ma non testata dopo la correzione dei path.

## Note per il backend

Nessuna nuova richiesta. Questa sessione non ha modificato API endpoint. L'unico endpoint usato (e già esistente) è:
- `PATCH /v1/tasks/{id}` — con campo `completed` (accettato da `UpdateTaskRequest`)

Il fix `EncryptCookies` in `bootstrap/app.php` della sessione precedente è ancora presente e funzionante.

## File rilevanti

- `src/components/TaskItem.vue` — fix emit swap (complete ↔ delete)
- `src/idb/useTaskDB.js` — nuovo `deleteTask`, `savePendingReorder`, `getPendingReorder`, `clearPendingReorder`; filtro `REORDER_KEY` in `getAllTasks`
- `src/pages/TodoPage.vue` — integrazione TaskItem, handler complete/delete con offline, fallback reorder offline, syncLocalTasks esteso, onMounted esteso con pending reorder
