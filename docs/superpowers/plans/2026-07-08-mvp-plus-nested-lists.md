# PLAN — MVP+ Liste Annidate (Frontend)

**Data**: 2026-07-08
**Repo**: tobear-vuejs-frontend (`frontend/`)
**Scope**
- **Phases 0+2+3+4+5**: implementazione UI liste annidate su mobile e desktop.
- **Phase 6**: polish assets + setup Namecheap (dominio/hosting) + .env production.
- **Phase 7**: deploy su tobear.in + smoke test finali.
- **Phase 8**: preparazione asset per promozione Reddit.
**Dipende da**: **Phase 1 (backend)** deve essere completata e pushata prima di iniziare Phase 2 (stato Pinia) e Phase 3 (test API). **Leggi il backend plan** in `backend/docs/superpowers/plans/2026-07-08-mvp-plus-nested-lists.md`.

---

## Tempistiche stimate

| Phase | Cosa | Tempo |
|---|---|---|
| Phase 0 | Tech spike gesture + wireframe + branch | 1-2 giorni |
| Phase 2 | Pinia + IndexedDB + useGuestMigration | 2-3 giorni |
| Phase 3 | Mobile UX Clear-like | 5-7 giorni |
| Phase 4 | Desktop UX | 4-5 giorni |
| Phase 5 | Onboarding upsell banner + /premium | 1-2 giorni |
| Phase 6 | Polish assets + Namecheap setup | 2-3 giorni (parallel) |
| Phase 7 | Deploy + smoke test finali | 3-5 giorni |
| Phase 8 | Promo Reddit prep | 3-5 giorni (post-stabilità) |

Totale ~5-7 settimane (rientra in target 1-2 mesi).

---

## Principi di progetto (validati col TL)

| Principio | Decisione |
|---|---|
| Schema esiste già su backend | `parent_id` nullable + `depth` unsignedTinyInt su `tasks`. Max depth 2. C'è già migration + API dopo Phase 1 backend |
| Tipo "list" vs "leaf" | **Implicito**: ogni task parte leaf, diventa "list" quando ha figli. Niente `is_list` flag. Computato via `hasChildren` |
| Drag&drop | Solo intra-level (riordino fratelli). `vuedraggable` con `group: { pull: false, put: false }` per sibling group |
| Creazione "+" | Pulsante unico contestuale. Al top-level → crea root. Dentro una lista → crea figlio (auto parent_id). Clear-style |
| Completamento lista | Cascade silenziosa locale: completare root → completed=true su tutti i figli |
| Delete lista con figli | Modal confirm esplicita + `?cascade=true` call |
| Mobile gestures | Swipe sx = complete, swipe dx = delete, swipe giù = ascend, tap riga = drill-in se hasChildren / edit inline se leaf |
| Onboarding sync | Banner subtle dopo 2a root list creata ("Sync with toBear Classic") |
| Deployment | `tobear.in` su Namecheap shared hosting. AUTH_ENABLED=false (guest-only MVP). Niente Play Store/Stripe ancora |

---

## Phase 0 — Setup + decisioni tecniche (1-2 giorni)

### 0.1 Branch
```bash
git checkout main
git pull
git checkout -b feat/nested-lists
```

### 0.2 Tech spike gesture drill-in (3-4 ore)
Prototipo su PWA installata su Android reale (o emulatore) per validare la gesture di drill-in.

**Opzioni candidate**:

| Opzione | Meccanica | Pros | Cons |
|---|---|---|---|
| A) Tap sulla riga | Tap → se hasChildren drill-in, se leaf edit inline | Semplice, mobile-native, prevedibile | Perde la "magia" Clear, conflitto con tap per edit se leaf |
| B) Swipe destra breve | Swipe dx su riga con children → drill-in | Specchio naturale di swipe-dx=delete, gestuale | Overlap con delete gesture (swipe dx sempre più lungo) |
| C) Pinch-in (Clear) | Due dita verso il centro sulla riga → drill-in | Più fedele a Clear | Pinch-zoom browser conflict su PWA, difficile da implementare bene su web |
| D) Doppio tap | Double-tap sulla riga → drill-in | Semplice | Confuso, non standard |

**Raccomandazione tecnica**: **Opzione A (tap sulla riga)** con UX differenziata:
- Task leaf: tap → seleziona (apre edit inline)
- Task hasChildren: tap → drill-in (entra nella lista)
- Indicatore visivo: icone subtle > / v sul lato destro per liste, nessuna per leaf

Testare su device reale prima di inchiodare.

### 0.3 Wireframe lo-fi
Prima di codare, disegnare:
- Top-level view: root lists verticali
- Drill-in view: breadcrumb + task della lista corrente
- Empty state per root empty / list empty
- Delete modal per lista con figli ("Eliminando «X» eliminerai N figli")
- Cascade complete animation
- Upsell sync banner

### 0.4 Aggiornamento TODO.md
Spuntare come ✅ completati:
- Brotli superato per bundle ≤300KB (grazie a PROMPT 7)
- i18n vue-i18n già esistente (en.json + it.json)
- Color contrast fixato (commit `3482a80`)
- 401 /api/user soppresso (commit `3482a80`)
- Performance Lighthouse 98 (PROMPT 8)

Aggiungere nuova sezione `[MVP+] Liste Annidate`.

---

## Phase 2 — Frontend state layer (2-3 giorni)

### 2.1 Pinia store `tasks` (Options API, secondo convention)

```js
// src/stores/tasks.js (o estensione esistente)
state: () => ({
  tasksById: {},       // { [id]: task }
  loading: false,
})

getters: {
  rootTasks: (state) =>
    Object.values(state.tasksById)
      .filter(t => t.parent_id === null)
      .sort((a, b) => a.order - b.order),

  childrenOf: (state) => (parentId) =>
    Object.values(state.tasksById)
      .filter(t => t.parent_id === parentId)
      .sort((a, b) => a.order - b.order),

  hasChildren: (state) => (id) =>
    Object.values(state.tasksById)
      .some(t => t.parent_id === id),  // computed da tasksById ogni volta
}

actions: {
  async fetchTasks() {
    // GET /v1/tasks → salva in tasksById
    // Fallback: getAllTasks() da IndexedDB
  },
  async createTask({ title, parentId = null }) {
    const tempId = `local-${Date.now()}`
    const temp = { id: tempId, title, parent_id: parentId, depth: 0,
                   completed: false, order: Infinity, localOnly: true }
    DB.saveTask(temp)  // Optimistic
    try {
      const { data } = await axiosClient.post('/v1/tasks', { title, parent_id: parentId })
      DB.removeTask(tempId); DB.saveTask(data.data)
    } catch {
      // Mantieni locale
    }
  },
  async completeTask(id) {
    // Se hasChildren: cascata locale + PATCH /v1/tasks/complete
    // Se leaf: PATCH /v1/tasks/{id} { completed: true }
  },
  async deleteTask(id, { cascade = false }) {
    // DELETE /v1/tasks/{id} + ?cascade=true
  },
  async moveTask(id, newParentId) {
    // PATCH /v1/tasks/{id}/move { parent_id: newParentId }
  },
  async reorderSiblings(parentId, orderedIds) {
    // PATCH /v1/tasks/reorder { parent_id: parentId, ordered_ids: orderedIds }
  },
}
```

**Important**: il pattern offline-esistente va replicato. Ogni azione muta prima `tasksById` local, poi tenta rete. Se rete fallisce, resta locale con flag `localOnly`.

### 2.2 IndexedDB — useTaskDB.js schema bump

Bump a v2 della versione IndexedDB:
```js
const DB_VERSION = 2  // era 1
db.createObjectStore('tasks', { keyPath: 'id' })
store.createIndex('parent_id', 'parent_id', { unique: false })
```

Aggiungi helper:
- `getRootTasks()`
- `getChildrenOf(parentId)`
- `saveTasks` esistente: semplicemente salva tutto con i nuovi campi (retrocompatibile)

Migration da v1: se `parent_id` non esiste su un record vecchio, default null. Se `depth` non esiste, default 0. Backend fa lo stesso.

### 2.3 useGuestMigration.js — ricorsivo

```js
async function migrateTask(task, parentIdMap) {
  const remote = await axiosClient.post('/v1/tasks', {
    title: task.title,
    completed: task.completed,
    parent_id: parentIdMap[task.parent_id] || null,
  })
  parentIdMap[task.id] = remote.data.data.id

  const children = await DB.getChildrenOf(task.id)
  for (const child of children) {
    await migrateTask(child, parentIdMap)
  }
}

// Entry point: per tutte le root (parent_id null)
async function migrateAll() {
  const roots = await DB.getRootTasks()
  const parentIdMap = {}
  for (const root of roots) {
    await migrateTask(root, parentIdMap)
  }
}
```

**Rischio**: Nested migration chiama N+1 POST. Funziona per scala attuale (decine di task). Se serve better performance, endpoint `POST /v1/tasks/batch-import` è nei Todolist futuri.

---

## Phase 3 — Mobile UX Clear-like (5-7 giorni)

### 3.1 Componenti Vue

| Componente | Cosa fa |
|---|---|
| `NestedRootView.vue` | Mostra root lists. Pulsante + crea root. Empty state quando vuoto |
| `NestedListView.vue` | Mostra children of current task. Breadcrumb nav. + crea children |
| `TaskItem.vue` (modificato) | Mostra riga. Se `hasChildren`, mostra icona > a destra. Tap → drill-in / edit |
| `TaskListTitle.vue` | Header della view corrente: titolo (o "Tasks" per root) + swipe-giù handler |
| `BreadcrumbNav.vue` | Home › Lista › Sottolista (tap su segmento → naviga) |
| `CascadeConfirmModal.vue` | Modal per delete lista con figli. "Eliminando X eliminerai N figli" |

### 3.2 Routing

```js
// router/index.js
{
  path: '/todo',
  name: 'Todo',
  component: () => import('@/pages/TodoPage.vue'),
},
{
  path: '/todo/:taskId',
  name: 'TaskList',
  component: () => import('@/pages/TodoPage.vue'),
  props: true,
},
```

**TodoPage.vue** diventa container che decide quale sub-view renderizzare basata su `$route.params.taskId`.

### 3.3 Drag&drop intra-level

```vue
<draggable
  v-model="currentChildren"
  group="siblings-of-{{ parentId }}"
  :group="{ name: `siblings-${parentId}`, pull: false, put: false }"
  item-key="id"
  @end="onReorder"
>
  <template #item="{ element }">
    <TaskItem :task="element" />
  </template>
</draggable>
```

**Rischio TDZ**: vuedraggable con `group` multiple stesso nome per sibling groups. Testare cross-level non avviene. `pull: false, put: false` blocca ogni movimento cross.

### 3.4 Gesture mobile

| Gesto | Elemento | Action | Stato |
|---|---|---|---|
| Swipe sx (release) | TaskItem | Complete (toggle completed) | Esiste, mantieni |
| Swipe dx (release) | TaskItem | Delete (mostra confirm se hasChildren, altrimenti delete secco) | Esiste, mantieni |
| Swipe giù (release) | NestedListView title/breadcrumb area | Ascend (back to parent) | 🆕 |
| Tap su TaskItem hasChildren | TaskItem | Drill-in (naviga a /todo/:taskId) | 🆕 (da tech spike 0.2) |
| Tap su TaskItem leaf | TaskItem | Seleziona → edit inline title | 🆕 |
| Long-press su TaskItem | TaskItem | Menu: Move to…, Delete cascade (bonus) | 🟡 Opzionale MVP+ |

### 3.5 Pulsante "+" contestuale

- **Top-level** (`$route.params.taskId === undefined`): crea task root (`parent_id=null, depth=0`)
- **Dentro una lista** (`$route.params.taskId` presente): crea figlio (`parent_id=taskId, depth=parent.depth+1`)
- **Logica**: ogni nuovo item è leaf. Se più tardi qualcuno gli aggiunge figli, diventa lista implicitamente. Niente tipo pre-selezionato. Clear-style.

### 3.6 Cascade completamento silenzioso

```js
// Dentro store action completeTask
completeTask(id) {
  const task = this.tasksById[id]
  if (!task) return

  // Cascade locale
  function cascade(tId) {
    const children = Object.values(this.tasksById).filter(t => t.parent_id === tId)
    for (const child of children) {
      child.completed = true
      cascade(child.id)  // ricorsivo
    }
  }
  cascade(id)
  task.completed = true

  // PATCH backend (con cascade)
  await axiosClient.patch(`/v1/tasks/${id}/complete`, { cascade: true })
}
```

### 3.7 Delete modal per lista con figli

- Hook: `deleteTask(id)` nel store
- Se `hasChildren(id)` → mostra `CascadeConfirmModal`
- Modal text: "Eliminando «{{ task.title }}» eliminerai {{ count }} task figli. Non puoi annullare."
- Pulsanti: "Elimina tutto" (primary) / "Annulla" (secondary)
- Su confirm: `deleteTask(id, { cascade: true })` → DELETE `/v1/tasks/${id}?cascade=true`
- Su success: naviga al parent (se dentro una lista) o top-level

### 3.8 Empty state copywriting

| Frontiera | Testo | Action |
|---|---|---|
| Top-level vuoto | "Crea la tua prima lista" | Pulsante "+" evidenziato con bordino animato |
| Lista vuota | "Niente da fare qui. Tocca + per aggiungere task" | + pulsante attivo inline |

i18n chiavi: `nested.empty_root`, `nested.empty_list`, `nested.confirm_delete_title`, `nested.confirm_delete_body`

---

## Phase 4 — Desktop UX (4-5 giorni)

### 4.1 Pattern raccomandato

Estendere `AppLayout.vue` 3-colonne-xl:

```
┌─ DesktopSidebar (sinistra) ─┬─ RouterView (centro) ─┬─ DesktopContentPanel (destra, opzionale) ┐
│                              │                        │                                          │
│  Albero gerarchia            │  NestedRootView /      │  Dettaglio task selezionato               │
│  + Root List                 │  NestedListView        │  (opzionale, solo su click)               │
│    + Spesa                   │                        │                                          │
│    + Lavoro                  │                        │                                          │
│      * task 1                │                        │                                          │
│      * task 2                │                        │                                          │
│  + Hobby                     │                        │                                          │
│                              │                        │                                          │
└──────────────────────────────┴────────────────────────┴──────────────────────────────────────────┘
```

### 4.2 Tree sidebar

- Ogni root list ha padding-left basato su `depth × 16px`
- Click su row → naviga a `/todo/:taskId`
- Il path corrente è highlightato nel tree
- Expand/collapse inline dei figli (senza navigazione — visuale)
- Azione hover: ✓ complete, ✗ delete, ↩ move to… (menu droppdown)

### 4.3 Mappature mobile → desktop coesione

| Mobile gesture | Desktop equivalente |
|---|---|
| Swipe sx = complete | Hover reveal ✓ button |
| Swipe dx = delete | Hover reveal ✗ button |
| Swipe giù = ascend | Click breadcrumb path |
| Tap drill-in | Click row in sidebar or main |
| Long-press menu | Right-click context menu (future) |
| Drag intra-level | Same drag con mouse (vuedraggable ha built-in) |

### 4.4 Vista Desktop: nessuna gesture complessa

- Tutte le azioni hanno un pulsante/menu testuale o icona visibile su hover
- Il "drill-in" è un click normale, non richiede gesture
- Il centro mostra la stessa lista che si vede su mobile, con styling desktop-responsive

No bisogno di creare "due app". Priorità: mobile UX è la star. Desktop è funzionale e coeso, ma non replica gesture nel mouse.

---

## Phase 5 — Onboarding sync upsell (1-2 giorni)

### 5.1 Store computed
```js
rootListsCount: (state) =>
  Object.values(state.tasksById).filter(t => t.parent_id === null).length
```

### 5.2 Trigger
- `rootListsCount >= 2`
- `!dismissedUpsellBanner` (localStorage key)
- `!isAuthenticated` (per sicurezza — auth non esiste ancora in MVP)

### 5.3 Banner component
```vue
<div
  v-if="showBanner"
  class="fixed bottom-16 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-3rem)] max-w-sm ...
       rounded-2xl border border-tb-border bg-tb-surface shadow-xl p-3"
>
  <p class="text-xs text-tb-text-sec">
    {{ $t('upsell.banner') }}
  </p>
  <button @click="goPremium" class="...">
    {{ $t('upsell.cta') }}
  </button>
  <button @click="dismiss" class="...">✕</button>
</div>
```

### 5.4 i18n keys
```json
{
  "upsell": {
    "banner": "Sincronizza le tue liste su più dispositivi con toBear Classic",
    "cta": "Scopri",
    "dismiss": null
  }
}
```

### 5.5 Route /premium
- Pagina statica con copy "toBear Classic – Sync"
- "Coming soon. Registrati per essere avvisato." (form email collection optional)
- NO Stripe integration ancora

---

## Phase 6 — MVP polish + setup Namecheap (2-3 giorni, parallel con Phase 2-5)

### 6.1 Assets mancanti
- `frontend/public/icon.svg` — creare versione vettoriale del logo theme-color `#8b5e3c`
- `frontend/public/favicon.svg` — icona semplificata (single bear silhouette? o simbolo) — fallback a icon-16x16.png non SVG?

**NON necessario per MVP**: gli svg sono richiesti da PWABuilder come opzionali. Fallback PNG già funziona. Spuntali come .gitkeep in public/ e risolvi con design finale più avanti.

### 6.2 ottimizzare `img/tobear.png`
1.4MB → < 500KB. Tool:
```bash
npm install -D sharp
npx sharp img/tobear.png --resize 1080 --quality 60 --output img/tobear-optimized.png
```
Oppure servizi esterni (squoosh.app). Il file serve da screenshots PWA.

### 6.3 Acquistare dominio + hosting Namecheap (manuale)
- Dominio: `tobear.in` (~12$/anno)
- Hosting: Namecheap Stellar Shared (~$5.88/mese)
- DNS: `tobear.in` A record → IP hosting
- DB MySQL: crea su cPanel
- Mail: default Namecheak SMTP (`mail.tobear.in`), anche se per MVP AUTH=false non urgente

### 6.4 .env.production frontend
```
VITE_BASE_URL=/
VITE_API_BASE_URL=/api
VITE_AUTH_ENABLED=false
VITE_MATOMO_HOST=
VITE_MATOMO_SITE_ID=
```
Matomo: da configurare con ID reale da stats.tobear.x10.mx (o nuovo endpoint su Namecheap — forse reinstallare su nuovo hosting).

### 6.5 .env.production backend (coordinamento cross-repo)
Vedi backend plan Phase 6.10. I valori vanno accordati:
```
FRONTEND_URL=https://tobear.in
SESSION_DOMAIN=tobear.in
CORS_ALLOWED_ORIGINS=https://tobear.in
```

### 6.6 GitHub Secrets
Per deploy FTP di entrambi i repo:
- `ftp_server_x10` → IP Namecheap
- `ftp_username_x10` → cPanel username
- `ftp_password_x10` → password FTP
- `ftp_folder_x10` → `public_html/` (o `/` di default per Laravel in subdirectory)
Per backend: DB_*, MAIL_*, APP_KEY, ARTISAN_DEBUG_TOKEN, CONTACT_NOTIFICATION_EMAIL

### 6.7 Re-test Lighthouse
Dopo Phase 3 completata, esegui:
```bash
npx lighthouse https://tobear.x10.mx/app/todo (o https://tobear.in appena deployato)
```
Target mantenere:
- Performance ≥ 85
- A11y = 100
- SEO = 100
- BP = 100

---

## Phase 7 — Deploy + smoke test (3-5 giorni)

### 7.1 Push su main

**Ordine**: backend prima (API deployata), poi frontend (SPA deployata). GitHub Actions fa FTP deploy automatico.

### 7.2 Smoke test su tobear.in

| # | Test | Criterio |
|---|---|---|
| 7.2.1 | PWA installable Chrome Android | Aggiungi a schermata home funziona |
| 7.2.2 | Offline 100% | Crea task offline → reload → visibili → torna online |
| 7.2.3 | Nested list create | Root → drill-in → create figlio → cascade complete → delete con modal |
| 7.2.4 | Drag&drop intra-level | Riordino funziona solo entro stesso grupo |
| 7.2.5 | Mobile gestures | Swipe sx complete, swipe dx delete, swipe giù ascend, tap drill-in |
| 7.2.6 | Desktop tree sidebar | Albero navigabile, click row drill-in, hover actions |
| 7.2.7 | Upsell banner | Dopo 2a root list, banner Compare |
| 7.2.8 | Lighthouse final | Perf ≥85, A11y 100, SEO 100, BP 100 |
| 7.2.9 | Matomo tracking | Visit counter attivo, eventi install/create |

### 7.3 Web vitali su device reali
- Testa su Android Chrome + iOS Safari (PWA su iPhone ha alcune limitazioni note per base /)
- Verifica: scroll performance su lista lunga (100+ task)
- Verifica: IndexedDB persistenza cross-sessione

### 7.4 x10hosting decommission
- Dopo 48h di stabilità su Namecheap
- Opzionale: tieni come staging + test env

---

## Phase 8 — Pre-promo Reddit prep (3-5 giorni, dopo deploy stabile)

### 8.1 Assets per post

| Asset | Cosa |
|---|---|
| **GIF demo** (30s max) | PWA install → nested list creation → offline test → cascade complete — mostra value prop in 30s |
| **Screenshots** (3) | Root list view, drilled-in list, empty state |
| **Logo** | Icona 128x128 per post thumbnail (trasparent background) |

Tool: `kap` (macOS) / `peek` (Linux) per GIF. Oppure registra video, converti con ffmpeg.

### 8.2 Subreddit target
- r/PWA (primario)
- r/webdev
- r/SideProject
- r/InternetIsBeautiful
- r/productivity
- r/Selfhosted (if the app appeals to privacy-adjacent crowd)

### 8.3 Post template r/PWA
```
Title: [Showcase] I built toBear — a Clear-style offline-first todo PWA with nested lists.
No account required, your data stays on your device.

Body:
- What: offline-first PWA todo app inspired by the Clear iOS app
- Key features: nested lists (drag&drop), swipe gestures (complete/delete), cascade completion, offline 100%
- Technical: Vue 3 + Vite + vite-plugin-pwa + Laravel API
- No account, no sync (yet), no tracking (except Matomo for page views)
- Free, no ads, no upsells (initial phase)

I'd love your feedback on:
1. Mobile UX (the gesture system)
2. Desktop UX (tree sidebar)
3. The "lists are implicit" concept (every item can become a list)

[GIF]
[Screenshots]

Try it: https://tobear.in
```

### 8.4 Matomo event tracking aggiungi
```js
// Reddit source detection
if (document.referrer.includes('reddit.com')) {
  _paq.push(['trackEvent', 'Traffic', 'Reddit', document.referrer])
}
```

### 8.6 Landing ottimizzazione
La homepage `/` (se esiste) o `/todo` → prima impressione conta:
- Load time < 2s (Lighthouse già ✅)
- Empty state accogliente (Phase 3.8)
- First-run experience: 1a lista auto-created "Welcome" con 2 task precompilati tutorial (bonus, futuri)

---

## Vincoli architetturali (crosscut)

### Forward-compat sync
- Pinia store ha `tasksById` — quando sync arriverà, aggiungere campo incrementale `last_synced` o `sync_version`
- IndexedDB campi `parent_id` + `depth` già pronti
- useGuestMigration → extend per sync (stesso pattern ricorsivo)
- Nessuna breaking change: tutti gli utenti early avranno dati strutturati compatibili

### Retrocompatibilità IndexedDB
- Schema bump v1→v2: aggiungi campi con default. I task esistenti (nessuno reale su x10hosting) hanno default null/0
- Verifica: upgrade IndexedDB database version non perde dati esistenti (trigger `onupgradeneeded`)

### No breaking per early users
- Lo schema dei dati locali (IndexedDB) va forward-compat solo via campi additivi
- `parent_id: null` per old data
- `depth: 0` per old data
- Backend risposta API già include i nuovi campi → frontend li save in IndexedDB → quando sync arriva, sono già lì

---

## Rischi tecnici frontend

| Rischio | Prob | Mitigation |
|---|---|---|
| vuedraggable cross-level drag nonostante `pull:false` | Media | Testare su browser reale. Se succede, wrapper key diverso per sibling group (non solo base `siblings-${parentId}`) |
| IndexedDB upgrade perde dati tra v1→v2 | Bassa | Testare: upgrade handler NON deve creare new store se esiste, solo add index. `onupgradeneeded` idempotente |
| Swipe-giù conflitto con scroll verticale pagina | Alta | Implementare swipe-giù **solo** sull'header/breadcrumb area, NON sulla task list scrollabile |
| Pinch-zoom browser cattura due dita | Alta (se pinch scelto) | Phase 0.2 spike deve testare. Se fallisce, switch a tap + arrow button |
| TDZ/multi-chunk vs vuedraggable con group | Bassa | TDZ già risolta in PROMPT 7. Singolo vendor chunk tiene vue + vuedraggable insieme. Nessun chunk splitting |

---

## Riferimenti

- Backend plan: `backend/docs/superpowers/plans/2026-07-08-mvp-plus-nested-lists.md`
- Frontend AGENTS.md: `AGENTS.md`
- Current components: `src/pages/TodoPage.vue`, `src/views/AppLayout.vue`, `src/components/MobileNavFab.vue`, `src/components/TaskItem.vue`
- Current store: `src/stores/tasks.js` (se esiste) — altrimenti state in TodoPage.vue

---

## Appendice — Prompt per avvio sessione

Il flusso seguente è comando `/mvp-plus` (ex PROMPT 9, testo integrale in `docs/superpowers/reports/PROMPT-fe-archivio.md`).
