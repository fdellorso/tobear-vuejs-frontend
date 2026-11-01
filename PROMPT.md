PROMPT 2 — Sessione Frontend (apri sessione su frontend/)
Sei il Technical Lead del progetto Tobear, repo frontend Vue/PWA. Esegui il piano di hardening pre-deploy salvato in questo repo.

## Prerequisito

Il backend è già stato hardenato e committato (piano backend eseguito). Verifica leggendo l'handoff backend più recente in ../backend/handoffs/ se vuoi contesto cross-repo.

## Bootstrap (OBBLIGATORIO, in ordine)

1. Leggi AGENTS.md per intero.
2. Leggi TODO.md.
3. Leggi gli ultimi 2 file in handoffs/ (più recente per primo).
4. Leggi docs/superpowers/plans/2026-07-06-hardening.md — È IL PIANO DA ESEGUIRE.
5. Per contesto: leggi ../docs/superpowers/reports/AUDIT-2026-07-06.md (audit completo).

## Decisioni già prese (NON rinegoziare)

- Deploy same-host: frontend dist/ deployato in backend/public/app/ via FTP. Backend catch-all serve index.html.
- VITE_BASE_URL=/app/ in .env.production. base in vite.config.js diventa dinamico: env.VITE_BASE_URL || '/'.
- VITE_API_BASE_URL=/api (same-origin, relativo).
- CSP same-origin: connect-src 'self' (rimuovi URL hardcoded laravel.fritz.box da index.html).
- SW API caching: urlPattern come regex string /\/api\// (NON funzione con closure env — causa ReferenceError in sw.js).
- viteCompression: algorithm 'gzip' + ext '.gz' (non brotli, shared hosting x10 potrebbe non averlo).
- Logout: router.push({ name: 'Todo' }) NON { name: 'Home' } (route Home inesistente).
- manifest prod_x10: start_url/scope /app/, lang "en".

## Esecuzione

Esegui le 8 sezioni del piano in ordine. Per ogni sezione:

- Mostrami cosa modifichi prima di farlo.
- Dopo le modifiche, esegui npm run lint + npm run test (vitest).
- Se lint o test falliscono, fermati e correggi.

Alla fine:

1. Scrivi handoff in handoffs/2026-07-06-hardening-build-pre-deploy.md (formato /handoff).
2. Esegui npm run format.
3. Mostrami git status + git diff --stat per revisione.
4. Commit con messaggio Conventional Commits EN: "fix: harden build and security for pre-production deploy" + body.
5. NON eseguire git push — lo faccio io.

Inizia leggendo i file del bootstrap e fammi un riepilogo del piano prima di modificare.

---

PROMPT 5 — Sessione Frontend Fix Post-Validazione (apri sessione su frontend/)
Sei il Technical Lead del progetto Tobear, repo frontend Vue/PWA. Esegui il piano di fix post-validazione salvato in questo repo.

## Prerequisiti (devono essere già fatti)

- Frontend hardenato, committato, pushato, deployato su x10hosting (PROMPT 2).
- Backend fix post-validazione già eseguito (PROMPT 4), o almeno il backend è funzionante e accessibile.
- Validazione post-deploy eseguita (PROMPT 3, root) → report in ../docs/superpowers/reports/VALIDATION-2026-07-07.md.
- 3 FAIL critici/alti trovati nel frontend: cspDynamicPlugin regex, path assoluti index.html, bundle size 520KB.

## Bootstrap (OBBLIGATORIO, in ordine)

1. Leggi AGENTS.md per intero.
2. Leggi TODO.md.
3. Leggi gli ultimi 2 file in handoffs/ (più recente per primo).
4. Leggi docs/superpowers/plans/2026-07-07-validation-fixes.md — È IL PIANO DA ESEGUIRE.
5. Per contesto: leggi ../docs/superpowers/reports/VALIDATION-2026-07-07.md (report validazione che ha generato il piano, sezioni B, D, E, G).

## Decisioni già prese (NON rinegoziare)

- cspDynamicPlugin regex fix: [^>]* sostituisce [\s\S]*? per matchare solo il meta CSP tag (non tutti i meta/link intermedi tra <meta charset> e il CSP). CRITICO: senza questo fix, PWABuilder score = 0, manifest/viewport/favicon assenti dall'HTML.
- Path index.html: da assoluti (/manifest.webmanifest, /favicon.ico, /img/icons/*) a relativi (manifest.webmanifest, favicon.ico, img/icons/*). Vite non riscrive gli href dei link tag non-asset. I path relativi risolvono correttamente a /app/ con le route top-level della SPA.
- Lazy loading router: pagine secondarie con () => import(...) in src/router/index.js. Mantenere eager AppLayout (sempre necessario). Opzionale: mantenere eager TodoPage per UX (è la pagina principale). Obiettivo bundle iniziale < 300KB.

## Esecuzione

Esegui le 4 sezioni del piano in ordine. Per ogni sezione:

- Mostrami cosa modifichi prima di farlo.
- Dopo le modifiche, esegui `npm run lint` + `npm run test` (vitest).
- Se lint o test falliscono, fermati e correggi.
- Per il fix #1 (cspDynamicPlugin): dopo il build, verifica con `grep -o 'href="[^"]*"' dist/index.html` che manifest, icon, viewport, theme-color siano presenti.
- Per il fix #3 (lazy loading): dopo il build, verifica con `ls -la dist/assets/*.js` che ci siano chunk separati (non un unico bundle).

Alla fine:

1. Scrivi handoff in handoffs/2026-07-07-fix-post-validazione.md (formato /handoff: Cosa è stato fatto / Stato attuale / Decisioni prese / Prossimi passi / Note per il backend / File rilevanti).
2. Esegui npm run format.
3. Mostrami git status + git diff --stat per revisione.
4. Commit con messaggio Conventional Commits EN: "fix: resolve post-deploy validation issues" + body con bullet dei fix.
5. NON eseguire git push — lo faccio io.

Inizia leggendo i file del bootstrap e fammi un riepilogo del piano prima di modificare.

---

# PROMPT 9 — Phases 0+2-5+6+7+8 Piano MVP+ (Frontend — Liste Annidate)

Sei il Technical Lead del frontend Vue 3 di toBear (repo: `tobear-vuejs-frontend`, cartella `frontend/`).

## Bootstrap (OBBLIGATORIO)
1. Leggi `AGENTS.md` (convenzioni + regole no-push, no-amend).
2. Leggi il piano: `frontend/docs/superpowers/plans/2026-07-08-mvp-plus-nested-lists.md`.
3. Leggi gli ultimi 2 handoff in `frontend/handoffs/`.
4. Solo dopo, inizia.

## ⚠️ Assunzione critica — PRIMA DI INIZIARE
**Phase 1 (backend API liste annidate: `parent_id` + `depth` + reorder per-sibling + cascade endpoints) DEVE essere completata e pushat su main**, altrimenti non puoi testare Phases 2-3 via API.

**Cosa fare:** contattami in chat ("Backend Phase 1 e completata?") PRIMA di iniziare Phase 2. Se si, procedi. Se no, aspetta che io completi l'altra sessione backend. **Non iniziare Phase 2 senza backend pronto.**

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
4. **TODO.md update**: spunta ✅ voci completate (brotli, i18n, color contrast, 401 soppresso, performance 98). Aggiungi sezione `[MVP+] Liste Annidate`.

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
3. **Coesione mobile→desktop**: mappa gesture a pulsanti (swipe sx = hover ✓, swipe dx = hover ✗, swipe giu = click breadcrumb).
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
- Il backend (Laravel) e in **repo separato**, gestito da altra sessione OpenCode. NON scrivere codice backend.
- NO `git push` senza richiesta esplicita.
- NO `git commit --amend` su commit gia pushati.
- Esegui `npm run lint && npm run format && npm run test && npm run test:e2e:pwa` prima di ogni commit.

## Stop point (cautela)
Alla fine di ogni phase, fermati e fammi un riepilogo di cosa hai fatto prima di proseguire alla successiva. **Non accelerare** — ogni phase ha impatto sulle successive e voglio revisionare i commit intermedi.
