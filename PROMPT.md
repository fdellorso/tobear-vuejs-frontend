PROMPT 2 — Sessione Frontend (apri sessione su frontend/)
Sei il Technical Lead del progetto Tobear, repo frontend Vue/PWA. Esegui il piano di hardening pre-deploy salvato in questo repo.

## Prerequisito

Il backend è già stato hardenato e committato (piano backend eseguito). Verifica leggendo l'handoff backend più recente in ../backend/handoffs/ se vuoi contesto cross-repo.

## Bootstrap (OBBLIGATORIO, in ordine)

1. Leggi AGENTS.md per intero.
2. Leggi TODO.md.
3. Leggi gli ultimi 2 file in handoffs/ (più recente per primo).
4. Leggi docs/plans/PLAN-hardening-2026-07-06.md — È IL PIANO DA ESEGUIRE.
5. Per contesto: leggi ../AUDIT-2026-07-06.md (audit completo).

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
- Validazione post-deploy eseguita (PROMPT 3, root todos_app/) → report in ../VALIDATION-2026-07-07.md.
- 3 FAIL critici/alti trovati nel frontend: cspDynamicPlugin regex, path assoluti index.html, bundle size 520KB.

## Bootstrap (OBBLIGATORIO, in ordine)

1. Leggi AGENTS.md per intero.
2. Leggi TODO.md.
3. Leggi gli ultimi 2 file in handoffs/ (più recente per primo).
4. Leggi docs/plans/PLAN-validation-fixes-2026-07-07.md — È IL PIANO DA ESEGUIRE.
5. Per contesto: leggi ../VALIDATION-2026-07-07.md (report validazione che ha generato il piano, sezioni B, D, E, G).

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
