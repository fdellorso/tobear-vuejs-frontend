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
