# Handoff — 2026-06-28 — Fix null user e audit accoppiamento auth

## Cosa è stato fatto

### 1. Audit di ricognizione sull'accoppiamento autenticazione (task di sola lettura)
- Mappato ogni punto del codice (frontend + backend) che assume un utente autenticato
- Confrontato schema dati Task in IndexedDB (`useTaskDB.js`) vs backend (migration + `TaskResource`)
- Verificato: `id` backend è integer autoincrement, id offline è stringa `local-${Date.now()}`
- Identificati campi solo-IDB: `localOnly`, `pendingComplete`, `pendingDelete`, `__pending_reorder__`
- Mappati 27 riferimenti a `useUserStore` in tutto il frontend (dettaglio nel report)
- Scoperto: `StackedLayout` ha `user` prop `required: true` — crasha se non passato

### 2. Bug fix: accesso a `user.name`/`user.email` senza null-check
- **`src/views/DefaultLayout.vue`**:
  - `const user = userStore.user` → `const user = computed(() => userStore.user)` (reattivo)
  - `const userProfile = { name: user.name, ... }` → `const userProfile = computed(...)` con optional chaining `user.value?.name ?? 'Utente'`
  - `<header>` ora ha `v-if="user"` — se `user` è null, StackedLayout e UserAvatar non vengono renderizzati. `<RouterView>` rimane sempre visibile.
  - Rimosso blocco commentato di `<NavBarElement>` e `Sign out` commentato (c'erano righe vuote senza contenuto).
- **`src/pages/UserProfile.vue`**:
  - `const user = userStore.user` → `const user = computed(() => userStore.user)`
  - Template: l'intero contenuto (DescriptionList + StatsSection) racchiuso in `v-if="user"`
  - Aggiunto `v-else` con messaggio "Devi aver effettuato l'accesso per vedere il profilo."
- Verifica: `npm run test` → 15/15 test passati; `npm run lint` → 0 nuovi errori (i 38 pre-esistenti sono markdown/e2e-test/PaginationElement, non toccati)

## Stato attuale
- **DefaultLayout** non crasha più se `user` è null: mostra solo `<RouterView>` senza header/navbar.
- **UserProfile** non crasha più: mostra messaggio placeholder se non autenticato.
- **Niente di rotto** al momento. I test Vitest passano tutti.
- **Uncommitted changes**: `src/views/DefaultLayout.vue`, `src/pages/UserProfile.vue`.
- Il router guard (`beforeEach`) rimane invariato — il fix è solo difensivo nei componenti.

## Decisioni prese
- **`v-if="user"` sull'header di DefaultLayout invece di passare un oggetto fittizio**: `StackedLayout` ha `user: { required: true }` e non può ricevere `null`. Rimuovere `required` da StackedLayout sarebbe stato più invasivo (componente tailwindplus scafoldato) — preferito il condizionale nel chiamante.
- **`computed` per `user` invece di snapshot diretto**: la vecchia riga `const user = userStore.user` era una fotografia non reattiva al momento del mount. Con `computed`, il componente reagisce ai cambiamenti dello store (utile se il componente sopravvive a un login/logout senza ricaricamento pagina).
- **Nessuna modifica al router guard**: esplicitamente escluso dal task. Deciso di separare "fix difensivo nei componenti" da "cambiamento di accesso alle route" che va valutato quando si introduce la modalità locale-only.
- **Nessuna modifica a TODO.md**: il bug fix non corrisponde a nessuna voce del TODO.

## Prossimi passi (in ordine di priorità)
1. **Decidere come gestire la modalità locale-only senza account** — il report di audit ha mappato tutti i punti di accoppiamento. I prossimi passi architetturali dovrebbero essere: rimuovere `requiresAuth` da `/todo`, aggiungere un concetto di "modalità" nello user store (non binario), e gestire la migrazione da ID locale a ID backend per il sync.
2. **Creare `offline.html`** per `navigateFallback` nel service worker (workbox) — voce di TODO.md "PWA service worker cache for offline" non ancora completata.
3. **Test E2E su swipe/drag** (da handoff precedente): verificare comportamento con Playwright in mobile emulato.
4. **Test Vitest per componenti Vue** (TaskItem swipe, TodoPage offline pattern) — ora che Vitest è configurato.
5. **Commit delle modifiche in sospeso** in `src/views/DefaultLayout.vue` e `src/pages/UserProfile.vue`.

## Note per il backend
Nessuna nuova richiesta API in questa sessione. Il report di audit ha rilevato che:
- Il backend non ha un endpoint di batch import per task — servirebbe `POST /v1/tasks/batch-import` per la futura migrazione da modalità locale a account Sync.
- Tutti gli endpoint task richiedono `auth:sanctum` + `verified` — per modalità locale il backend non serve (tutto su IndexedDB), ma il sync richiederà un approccio diverso.

## File rilevanti
- `src/views/DefaultLayout.vue` — header condizionale, user reattivo, userProfile computed
- `src/pages/UserProfile.vue` — user reattivo, guardia v-if + fallback messaggio
- `src/stores/user.js` — store binario (nessun concetto di "modalità")
- `src/router/index.js` — guard con requiresAuth (non modificato)
- `src/idb/useTaskDB.js` — IndexedDB senza namespace utente
- Backend: `app/Models/Task.php`, `app/Http/Controllers/V1/TaskController.php`, `database/migrations/2025_05_25_094438_create_tasks_table.php` — schema Task
