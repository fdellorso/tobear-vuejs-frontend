# Handoff — 2026-07-06 — Hardening build e sicurezza pre-deploy

## Cosa è stato fatto

Eseguito il piano `docs/plans/PLAN-hardening-2026-07-06.md` (sezioni critiche+alta sicurezza/build).

1. **CSP produzione** (`index.html`):
   - Rimossi 3 blocchi CSP: commento morto (righe 53-56), CSP con `laravel.fritz.box:8080/8000` hardcoded (57-60), `object-src 'self'` separato (61).
   - Sostituiti con CSP same-origin unificato: `script-src 'self' 'unsafe-inline'; connect-src 'self'; img-src 'self' data:; object-src 'self'`.

2. **SW API caching fix** (`vite.config.js`):
   - Sostituito `urlPattern: ({ url }) => { ... }` (funzione con closure `env` → `ReferenceError` in `dist/sw.js`) con `urlPattern: /\/\//` regex.
   - Mantenuti `NetworkFirst`, cacheName, networkTimeoutSeconds, expiration.

3. **Base path** (`vite.config.js` + `.env.production` + `prod_x10.manifest.webmanifest`):
   - `vite.config.js`: `base: env.VITE_BASE_URL || '/'` (dinamico, non hardcoded `'/'`).
   - `.env.production`: `VITE_BASE_URL=/app/` (slash finale per Vite subpath).
   - Manifest `prod_x10`: `start_url` e `scope` da URL assoluti a `/app/` (relativi).

4. **viteCompression** (`vite.config.js`):
   - `algorithm: 'gzip'` (era `'brotliCompress'` con extension `.gz` — mismatch). Allineato per x10hosting (gzip universale).

5. **Logout navigation** (`MobileNavFab.vue:164`, `DesktopSidebar.vue:203`):
   - `router.push({ name: 'Home' })` → `router.push({ name: 'Todo' })` (route `Home` inesistente).

6. **CI/CD workflow** (`.github/workflows/main.yml`):
   - `VITE_BASE_URL: /app/` (slash finale coerente).
   - Aggiunto step E2E opzionale su build produzione: `npx serve@latest dist -l 4173` + `npm run test:e2e:pwa`.

7. **Documentazione**:
   - `AGENTS.md`: stack aggiornato (porta 3001/http), sezione Architettura (AppLayout unico, rimosso tailwindplus+/GuestLayout/DefaultLayout/HomePage), Lingua (vue-i18n default EN), Comandi utili (`npm run dev` host 0.0.0.0:3001, http), Produzione (VITE_BASE_URL=/app/, VITE_API_BASE_URL=/api, deploy target backend/public/app/), Skills (tailwind-styling descrizione aggiornata).
   - `TODO.md`: checklist pre-deploy aggiornata con 8 item come [x], valori corretti.
   - `.opencode/skills/tailwind-styling/SKILL.md`: rimossa sezione tailwindplus/, palette sostituita con riferimento design system `tb-*` token.
   - `eslint.config.js`: aggiunto `docs/**` ai globalIgnores.

## Stato attuale

- **Lint**: 0 errori.
- **Test unitari (vitest)**: 3 suite, 34 test, tutti passanti.
- **Build**: `npm run build` produce bundle con CSP same-origin, base dinamico, SW urlPattern regex, compression gzip.
- **Working tree**: 12 file modificati (solo hardening). `.editorconfig`, `opencode.json`, `PROMPT.md`, `docs/` lasciati nello stato attuale (non committati).
- **Backend già hardenato** (handoff `backend/handoffs/2026-07-06-hardening-sicurezza-pre-deploy.md`).
- Blockers per deploy risolti: CSP, SW caching, base path, compression, logout navigation.

## Decisioni prese

1. **Deploy same-host**: frontend `dist/` in `backend/public/app/`, backend catch-all serve SPA. Confermato.
2. **CSP same-origin**: `connect-src 'self'` (rimossi URL hardcoded, nessun dominio esterno per API).
3. **SW urlPattern**: regex string `/\/\//` (non funzione con closure — causa ReferenceError).
4. **Base dinamico**: `env.VITE_BASE_URL || '/'` in vite.config.js, `.env.production` con `/app/`.
5. **Gzip**: `algorithm: 'gzip'` (non brotli, compatibile x10hosting).
6. **Logout**: naviga a `{ name: 'Todo' }` (non `{ name: 'Home' }` inesistente).
7. **Manifest prod_x10**: `start_url`/`scope` relativi `/app/`, lang `"en"`.
8. **CI E2E**: `npx serve@latest` inline (non aggiunto a devDeps).
9. **tailwind-styling skill**: aggiornata (non rimossa). Riferimenti tailwindplus/ rimossi, palette sostituita con tb-* token.
10. **`docs/` non committato**: directory piano esclusa dal repo (ignorata da eslint).

## Prossimi passi

1. **Tu**: `git push` per attivare CI/CD (dopo commit locale).
2. **Tu**: creare secrets GitHub mancanti (VITE_MATOMO_HOST, VITE_MATOMO_SITE_ID, FTP_*).
3. **Verifica post-deploy** (PWABuilder, offline API caching, SPA funzionante su subpath `/app/`).
4. **Feature principali**: liste annidate, sync multi-dispositivo.
5. **Debito tecnico**: lazy loading router, console.log in TodoPage, `form.description` morto, route guard `requiresAccount` enforcement.

## Note per il backend

- **Nessun cambiamento API.** Tutti gli endpoint invariati (stessi campi, stesso formato risposta).
- L'handoff backend (`../../backend/handoffs/2026-07-06-hardening-sicurezza-pre-deploy.md`) conferma che il backend è già hardenato e pronto.

## File rilevanti

```
index.html                              # MODIFICATO: CSP same-origin
vite.config.js                          # MODIFICATO: base dinamico, urlPattern regex, gzip
.env.production                         # MODIFICATO: VITE_BASE_URL=/app/
public/prod_x10.manifest.webmanifest    # MODIFICATO: start_url/scope /app/
src/components/MobileNavFab.vue         # MODIFICATO: logout → Todo
src/components/DesktopSidebar.vue       # MODIFICATO: logout → Todo
.github/workflows/main.yml              # MODIFICATO: VITE_BASE_URL=/app/, E2E step
AGENTS.md                               # MODIFICATO: stack, architettura, lingua, comandi, produzione
TODO.md                                 # MODIFICATO: pre-deploy checklist
eslint.config.js                        # MODIFICATO: docs/** globalIgnore
.opencode/skills/tailwind-styling/SKILL.md  # MODIFICATO: rimosso tailwindplus/, tb-* token
handoffs/2026-07-06-hardening-build-pre-deploy.md  # QUESTO FILE
```
