# Handoff — 2026-06-28 — Migrazione guest→authenticated

## Cosa è stato fatto

### 1. Backend: TaskController@store accetta `completed` in creazione
- Aggiunta una riga: `'completed' => $all['completed'] ?? false` nell'array `$data` di `TaskController@store` (già fillable nel model, già validato in `StoreTaskRequest`).
- Ora `POST /v1/tasks` può creare un task già completato in un unico passaggio, invece di richiedere create + update separati.

### 2. Nuovo composable `useGuestMigration.js`
- `src/composables/useGuestMigration.js` esporta `migrateGuestTasks()`.
- Logica a 3 casi per task con id `local-...`:
  - **pendingDelete**: rimosso da IndexedDB, zero chiamate HTTP (il task non è mai esistito sul backend).
  - **pendingComplete**: `POST /v1/tasks` con `completed: true` — creato già completato in un colpo solo.
  - **creazione pura**: `POST /v1/tasks` con `completed: false` (comportamento preesistente).
- Ordine: prima del ciclo fetcha `GET /v1/tasks` per calcolare `maxOrder` remoto, poi assegna `order: remoteMaxOrder + i + 1` a ogni task locale preservando l'ordine relativo.
- Fail-fast: al primo errore di POST si ferma (break), i task già migrati rimangono migrati, i non migrati restano in IDB per il prossimo retry.
- Idempotente: processa solo id `local-...`, e li rimuove da IDB dopo migrazione riuscita.

### 3. LoginPage.vue — hook migrazione dopo login
- `submitLogin` convertito da `.then()` a `async/await` strutturato.
- Dopo login OK: `clearSession()` → `fetchUser()` (setta `mode='authenticated'`) → `migrateGuestTasks()` → `router.push({ name: 'Todo' })`.
- Fix implicito del bug per cui `mode` restava `'guest'` dopo login (perché `clearSession()` non cambiava mode e il router guard skippava fetchUser).

### 4. TodoPage.vue — trigger secondario di retry
- Aggiunto `import { migrateGuestTasks }` e chiamata `await migrateGuestTasks()` in `onMounted` (dopo `syncLocalTasks()`).
- Aggiunto `migrateGuestTasks()` nell'`online` event listener.
- Se la migrazione primaria (login) fallisce a metà, al prossimo refresh o ritorno online viene ritentata.

### 5. Test Vitest per `useGuestMigration`
- `src/__tests__/useGuestMigration.test.js` — 8 test che mockano `axiosClient` e `fake-indexeddb`.
- Copre: no-op senza task locali, solo pendingDelete, pendingComplete, creazione pura, tutti e 3 insieme, remoteMaxOrder, fail-fast, skip se fetch remoto fallisce.

### 6. Test E2E pratico via Playwright su dominio reale
- Eseguito su `https://laravel.fritz.box:3000` (Caddy reverse proxy → Vite su :3001).
- Flusso completo: guest mode → creazione 3 task via UI → setup IDB con pendingComplete/pendingDelete → login → verifica UI + IDB + API backend.
- **8/8 check passati**: A migrato con ID numerico, B migrato completed=true, C cancellato scartato, nessun local- residuo, zero errori CORS/rete.

### 7. Backend tests confermati
- `php artisan test --filter=Task`: 14/14 passati (nessuna regressione).

## Stato attuale
- **Tutto funzionante**: 34 test Vitest passati (3 suite), 0 nuovi errori lint, backend 14/14 task test passati.
- **Uncommitted changes**: 5 file modificati + 2 nuovi (useGuestMigration.js, useGuestMigration.test.js) + 2 file ereditati dalla sessione precedente non ancora committati (DefaultLayout.vue, GuestLayout.vue).
- **Bug noto pre-esistente (non toccato)**: `syncLocalTasks()` processa ancora task con `localOnly` tramite POST, ma con task che hanno sia `localOnly` che ID backend integer (edge case se syncLocalTasks e migrateGuestTasks si sovrappongono in uno stesso caricamento). In pratica `syncLocalTasks()` è pensato per utenti già autenticati temporaneamente offline; `migrateGuestTasks()` processa solo id `local-...`, quindi non c'è sovrapposizione reale dopo il fix.

## Decisioni prese
- **Due meccanismi distinti tenuti separati**: `syncLocalTasks()` (per utente autenticato temporaneamente offline, gestisce flag pending su ID reali) e `migrateGuestTasks()` (per migrazione guest→authenticated una tantum, gestisce id `local-...`). Non unificarli — sono due casi d'uso diversi.
- **`completed: !!task.completed` invece di condizionare su pendingComplete**: più robusto, usa il valore salvato in IDB come unica fonte di verità. `handleComplete` setta sempre entrambi (`completed` + `pendingComplete`) nello stesso `saveTask`, quindi la differenza è ininfluente per i task locali, ma protegge da scenari futuri dove un task potrebbe avere `completed: true` senza `pendingComplete`.
- **Fail-fast invece di batch**: la migrazione usa POST individuali con stop al primo errore, non un endpoint batch. Scelta pragmatica: il numero di task guest è tipicamente piccolo (< 50), e un endpoint batch richiederebbe lavoro backend. Se in futuro servirà, si può ottimizzare.
- **Idempotenza basata sull'assenza di id `local-` in IDB**: dopo migrazione riuscita, il record `local-...` viene cancellato da IDB e sostituito col record backend (ID integer). Al successivo `migrateGuestTasks()`, il filtro `startsWith('local-')` non lo trova, quindi non viene duplicato.

## Prossimi passi (in ordine di priorità)
1. **Commit delle modifiche in sospeso**: 5 file modificati + 2 nuovi. Includono sia questa sessione (LoginPage, TodoPage, useGuestMigration, useGuestMigration.test, TaskController backend) sia la sessione precedente (DefaultLayout, GuestLayout).
2. **ProfileIcon.vue**: aggiornarlo per distinguere tra guest (mostra "Accedi/Registrati") e authenticated (mostra nome utente / avatar). Oggi mostra login in `v-else` — in guest mode sarebbe meglio mostrare un CTA di upgrade.
3. **Creare `offline.html`** per `navigateFallback` nel service worker (workbox) — voce TODO.md "PWA service worker cache for offline" non ancora completata.
4. **Test componenti Vue** (TaskItem swipe, TodoPage offline pattern) — Vitest è configurato, si possono aggiungere test per i componenti Vue con `@vue/test-utils`.
5. **Homepage frontend completing** (voce TODO.md ancora aperta: "Homepage frontend completing").

## Note per il backend
- **Già fatto in questa sessione**: `TaskController@store` ora accetta `completed` nel payload di creazione (1 riga aggiunta).
- Nessuna altra richiesta API nuova in questa sessione. La migrazione funziona con POST individuali sull'endpoint `/v1/tasks` esistente.
- Nessun endpoint batch necessario al momento.

## File rilevanti
- `src/composables/useGuestMigration.js` — **nuovo**: logica di migrazione guest→authenticated
- `src/pages/LoginPage.vue` — hook migrazione dopo login riuscito
- `src/pages/TodoPage.vue` — trigger secondario retry (onMounted + online)
- `src/__tests__/useGuestMigration.test.js` — **nuovo**: 8 test Vitest per migrateGuestTasks
- `backend/app/Http/Controllers/V1/TaskController.php` — +1 riga `'completed'` nell'array dati di store
- `src/views/DefaultLayout.vue` — header condizionale (ereditato da sessione precedente, non committato)
- `src/views/GuestLayout.vue` — nav filter (ereditato da sessione precedente, non committato)
