# MVP+ Phases 0+2-5+6+7+8 (Frontend — Liste Annidate)

Sei il Technical Lead del frontend Vue 3 di toBear (repo: `tobear-vuejs-frontend`, cartella `frontend/`).

## Bootstrap (OBBLIGATORIO)
1. Leggi `AGENTS.md` (convenzioni + regole no-push, no-amend).
2. Leggi il piano: `docs/superpowers/plans/2026-07-08-mvp-plus-nested-lists.md`.
3. Leggi gli ultimi 2 handoff in `docs/superpowers/handoffs/`.
4. Solo dopo, inizia.

## Assunzione critica — PRIMA DI INIZIARE
**Phase 1 (backend API liste annidate: `parent_id` + `depth` + reorder per-sibling + cascade endpoints) DEVE essere completata e pushata su main**, altrimenti non puoi testare Phases 2-3 via API.

**Cosa fare:** contattami in chat ("Backend Phase 1 è completata?") PRIMA di iniziare Phase 2. Se sì, procedi. Se no, aspetta che io completi l altra sessione backend. **Non iniziare Phase 2 senza backend pronto.**

Phase 0 (tech spike + wireframe) puoi farlo in parallelo — non dipende da API.

## Task — Implementa fasi del piano

### Phase 0 — Setup (1-2 giorni)
1. Crea branch `feat/nested-lists` da main.
2. **Tech spike gesture drill-in**: prototipa su PWA Android reale (o browser devtools mobile) le opzioni:
   - A) Tap sulla riga → drill-in (raccomandato)
   - B) Swipe destra breve
   - C) Pinch-in
   - Scegli la migliore e documenta la decisione.
3. **Wireframe lo-fi**: disegna (carta/Figma) le viste: top-level, drill-in, empty state, delete modal, cascade confirm.
4. **TODO.md update**: spunta le voci completate. Aggiungi sezione `[MVP+] Liste Annidate`.

### Phase 2 — Frontend state layer (2-3 giorni)
1. **Pinia store `tasks`** (Options API): `tasksById` dict, `rootTasks`/`childrenOf` getters, azioni CRUD + reorder. Inserisci pattern offline-first (IndexedDB fallback).
2. **IndexedDB `useTaskDB.js`**: bump v2, aggiungi `parent_id` + `depth` campi. Helper `getRootTasks()`, `getChildrenOf()`.
3. **useGuestMigration.js ricorsivo**: POST radice → ricevi id remoto → POST figli ricorsivo con `parent_id` mapping.
4. **API helpers**: `createTask({ title, parentId })`, `moveTask(id, newParentId)`, `deleteTaskCascade(id)`.

### Phase 3 — Mobile UX Clear-like (5-7 giorni)
1. Componenti: `NestedRootView`, `NestedListView`, `TaskItem` (modificato con indicator drill-in), `BreadcrumbNav`, `CascadeConfirmModal`.
2. Routing: `/todo` (root) + `/todo/:taskId` (drill-in). `TodoPage.vue` container decide view basata su params.
3. **Drag&drop intra-level**: vuedraggable per sibling group, `pull:false, put:false`. Non cross-level.
4. **Gesture mobile**: swipe dx=delete, sx=complete, swipe giu=ascend (solo su breadcrumb area).
5. **Pulsante "+" contestuale**: top-level → root list; dentro lista → figlio. Clear-style implicito.
6. **Cascade completamento silenzioso**: completare lista → tutti figli completed (locale + API con cascade).
7. **Delete modal**: se hasChildren → mostra "Eliminando X eliminerai N figli. Non puoi annullare." → `DELETE /v1/tasks/{id}?cascade=true`.
8. **Empty state**: i18n per root empty ("Crea la tua prima lista") e list empty ("Tocca + per aggiungere").

### Phase 4 — Desktop UX (4-5 giorni)
1. **Tree sidebar** (`DesktopSidebar` modifica): root lists + figli indentation. Click row → drill-in router.
2. **Hover actions**: complete/delete reveal su riga. Move to... menu dropdown.
3. **Coesione mobile→desktop**: mappa gesture a pulsanti (swipe sx = hover check, swipe dx = hover X, swipe giu = click breadcrumb).
4. **Niente due app**: mobile-first. Desktop riusa stessi componenti, aggiunge sidebar.

### Phase 5 — Onboarding sync upsell (1-2 giorni)
1. **Banner**: dopo 2a root list creata, mostra "Sincronizza 2 liste su piu dispositivi con toBear Classic" + bottone "Scopri" → `/premium`.
2. **Route `/premium`**: pagina statica "Coming soon" — NO Stripe.

### Phase 6 — Polish + Namecheap setup (2-3 giorni, parallel)
1. Assets: `icon.svg`, `favicon.svg` placeholder; ottimizza `img/tobear.png` 1.4MB → <500KB.
2. Re-test Lighthouse post-modifiche: target Perf ≥85, A11y 100, SEO 100, BP 100.
3. Acquista dominio `tobear.in` + Namecheap Stellar hosting (tu manualmente — chiedimi aiuto).
4. Configura `.env.production`: `VITE_BASE_URL=/`, `VITE_API_BASE_URL=/api`, `VITE_AUTH_ENABLED=false`.
5. Configura GitHub Secrets per FTP deploy Namecheap.
6. DNS: `tobear.in` A record → Namecheap IP. DNS propagation 24-48h.

### Phase 7 — Deploy + smoke test (3-5 giorni)
1. Push branch feat/nested-lists su main → GitHub Actions → FTP Namecheap.
2. Smoke test su `tobear.in`: PWA install, offline 100%, nested lists, cascade complete, delete modal, drag, gestures, desktop sidebar, upsell banner.
3. Fare Lighthouse finale su `tobear.in`. Target: Perf ≥85, A11y 100, SEO 100, BP 100.
4. Se tutto OK: fai commit, merge feat/nested-lists → main.

### Phase 8 — Pre-promo Reddit prep (3-5 giorni, post-stabilita)
1. Crea GIF demo 30s (PWA install → nested list → offline → cascade complete).
2. Screenshots (3). Logo 128x128.
3. Post template per r/PWA (incluso nel piano — copia da docs/superpowers/plans/).
4. Aggiungi Matomo event tracking per referrer Reddit.

## Coordinate
- Il backend (Laravel) è in **repo separato**, gestito da altra sessione OpenCode. NON scrivere codice backend.
- NO `git push` senza richiesta esplicita.
- NO `git commit --amend` su commit già pushati.
- Esegui `npm run lint && npm run format && npm run test && npm run test:e2e:pwa` prima di ogni commit.

## Stop point (cautela)
Alla fine di ogni phase, fermati e fammi un riepilogo di cosa hai fatto prima di proseguire alla successiva. **Non accelerare** — ogni phase ha impatto sulle successive e voglio revisionare i commit intermedi.

## TODO
Spunta in `TODO.md` le voci completate in questa sessione; se trovi voci stale o contraddittorie col piano, segnalale in chat invece di cancellarle.
