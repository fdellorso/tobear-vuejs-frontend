# Handoff — 2026-06-28 — Modalità guest/authenticated esplicita

## Cosa è stato fatto

### 1. Store user.js — stato mode esplicito (non più binario)
- Aggiunto campo `mode: null` nello state (`'guest'` | `'authenticated'` | `null`)
- Nuova azione `loadMode()` che legge `localStorage.getItem('tobear_mode')`
- Nuova azione `setMode(value)` che aggiorna state + localStorage (null rimuove la chiave)
- Nuova azione `clearSession()` che resetta `user` e `isUserLoaded` **senza toccare mode** (usata dal login per pulire cache prima del re-fetch)
- `fetchUser()` ora chiama `setMode('authenticated')` al successo
- `resetUser()` ora chiama `clearSession()` + `setMode('guest')` (logout → guest esplicito)
- `isAuthenticated` getter aggiornato a `state.mode === 'authenticated'`

### 2. Router + AppLayout.vue — route non più bloccanti
- **Creato** `src/views/AppLayout.vue` — nuovo layout per `/todo` con header condizionale:
  - authenticated → nome utente + "Esci"
  - guest → pulsanti "Accedi" e "Registrati"
- **`/todo` spostato** da `DefaultLayout` a `AppLayout` (path: `/todo`, child vuoto `path: ''`)
- **`/user` e `/setting`** ora hanno `meta: { requiresAccount: true }` invece di `requiresAuth` — le pagine mostrano fallback interno (v-if="user")
- **`DefaultLayout`** — rimosso `meta: { requiresAuth: true }` dal parent route
- **Guard** riscritto: non fa più redirect per `requiresAuth`/`requiresAccount`; solo per `meta.guest` (utente autenticato → lontano da login/register). All'avvio carica mode da localStorage, tenta fetchUser solo se mode !== 'guest', se fallisce e mode è null assume guest.

### 3. GuestLayout / DefaultLayout — navigation filter
- `GuestLayout.vue`: filtro nav ora esclude anche `!route.meta?.requiresAccount`
- `DefaultLayout.vue`: filtro nav ora include `requiresAuth || requiresAccount`. Aggiunto "Todo" in `userNavigation` per navigazione verso AppLayout

### 4. UserSettings.vue — fix null-safety (uguale a UserProfile.vue)
- `const user = userStore.user` → `computed(() => userStore.user)`
- `form.email` init: `user.value?.email ?? ''`
- Template wrappato in `<template v-if="user">`, aggiunto `v-else` con messaggio fallback

### 5. UserProfile.vue — early return per guest
- `fetchTasks()`: `if (userStore.mode !== 'authenticated') return` prima della chiamata HTTP

### 6. TodoPage.vue — comportamento condizionale guest/authenticated
- **Tutte le operazioni** (`fetchTasks`, `createTask`, `handleComplete`, `handleDelete`, `reorderTasks`): early return in guest mode — azione solo su IndexedDB, zero chiamate HTTP
- `syncLocalTasks()`: early return `if (userStore.mode === 'guest') return`
- `onMounted()`: sync + pending reorder + online listener — tutto condizionale a `mode !== 'guest'`
- **Banner upgrade** nel template: visibile solo se `mode === 'guest'`, stile gray-50 muted, link a Login e Register

### 7. LoginPage.vue — clearSession invece di resetUser
- `resetUser()` → `clearSession()`: evita transient `mode='guest'` durante login

### 8. Test aggiornati (userStore.test.js)
- Da 15 a 26 test: coprono `loadMode`, `setMode`, `clearSession`, `isAuthenticated` getter, persistenza localStorage, verifica che `resetUser` setta mode='guest', `fetchUser` setta mode='authenticated'

## Stato attuale
- **Tutto funzionante**: lint 38 errori (tutti pre-esistenti, 0 nuovi), test 26/26 passati
- **Niente di rotto** al momento. Il refactor è completo e coerente.
- **Uncommitted changes**: 10 file modificati + 1 nuovo (`AppLayout.vue`)
- **Bug pre-esistente noto**: `syncLocalTasks()` processa task `local-XXXXX` con `localOnly` tramite POST, ma i modificatori `pendingComplete`/`pendingDelete` su task con ID `local-XXXXX` falliscono (404). Task creati in guest e poi cancellati/completati non syncano correttamente dopo login — servirebbe una logica di priorità export per task `localOnly` che ignori i pending modifier su ID inesistenti.

## Decisioni prese
- **mode vive in user.js store** (non store separato) — intrinsecamente legato allo stato di auth
- **Persistenza in localStorage** (chiave `tobear_mode`) — permette di sapere "questo dispositivo ha scelto modalità locale" prima ancora che fetchUser() risponda
- **Primo avvio → guest di default**: se fetchUser() fallisce e mode è null, si assume guest automaticamente, salvato in localStorage. Nessuna landing di scelta.
- **Opzione B per meta design**: introdotto `requiresAccount: true` per `/user`/`/setting` invece di riusare `requiresAuth` con doppio significato. `GuestLayout` filtra via `!requiresAccount`, `DefaultLayout` include `requiresAuth || requiresAccount`.
- **/todo sotto AppLayout.vue dedicato**: non DefaultLayout (troppo pesante, legato a StackedLayout con user required), non GuestLayout (header diverso). Un layout minimale con header condizionale.
- **clearSession() separato da resetUser()**: il login pulisce la cache senza toccare mode, il logout imposta esplicitamente mode='guest'
- **ProfileIcon.vue non toccato**: rimandato a sessione futura

## Prossimi passi (in ordine di priorità)
1. **Fix sync localOnly → pendingComplete/pendingDelete**: task creati in guest con `local-XXXXX` id e poi marcati come completati/cancellati non syncano correttamente dopo login. Serve una logica che per task `localOnly` dia priorità all'export (POST) ignorando i pending modifier che puntano a ID backend inesistenti, oppure un endpoint `POST /v1/tasks/batch-import` che accetti anche stato completed/deleted.
2. **ProfileIcon.vue**: aggiornarlo per distinguere tra guest (mostra "Accedi/Registrati" con contestualizzazione) e "nessun user" (mostra solo login). Oggi mostra login in `v-else` — in guest mode sarebbe meglio mostrare "Upgrade" o "Account".
3. **Creare `offline.html`** per `navigateFallback` nel service worker (workbox) — voce TODO.md "PWA service worker cache for offline" non ancora completata.
4. **Test E2E su swipe/drag** (da handoff precedente): verificare comportamento con Playwright in mobile emulato.
5. **Test Vitest per componenti Vue** (TaskItem swipe, TodoPage offline pattern).
6. **Commit delle modifiche in sospeso** (10 file modificati, 1 nuovo).

## Note per il backend
Nessuna nuova richiesta API in questa sessione. Tuttavia serve un endpoint per la migrazione di task locali a un account:
- **`POST /v1/tasks/batch-import`** (o simile) — per importare task con id `local-XXXXX` e stati (completed, deleted) in blocco, dopo che un utente guest fa login. Attualmente `syncLocalTasks` POSTa un task alla volta, ma perde lo stato completed/deleted.

## File rilevanti
- `src/stores/user.js` — mode, loadMode, setMode, clearSession, resetUser aggiornato
- `src/router/index.js` — guard ternario, route con requiresAccount, AppLayout import
- `src/views/AppLayout.vue` — **nuovo** layout per /todo con header condizionale
- `src/views/DefaultLayout.vue` — nav filter updated + Todo in userNavigation
- `src/views/GuestLayout.vue` — nav filter updated (esclude requiresAccount)
- `src/pages/TodoPage.vue` — early return in guest per tutte le operazioni + banner upgrade
- `src/pages/UserProfile.vue` — early return in fetchTasks per guest
- `src/pages/UserSettings.vue` — null-safety fix (computed + v-if)
- `src/pages/LoginPage.vue` — clearSession() invece di resetUser()
- `src/__tests__/userStore.test.js` — 11 nuovi test per mode/persistenza
