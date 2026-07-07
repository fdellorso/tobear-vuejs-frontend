# Frontend Hardening — Piano di esecuzione

**Repo**: `frontend/`
**Scope**: solo critici+alta sicurezza/build
**Base**: audit `AUDIT-2026-07-06.md` (sezioni 7, 8, 12)
**Architettura di deploy**: same-host, backend catch-all serve SPA da `public/app/`. Frontend `dist/` deployato in `backend/public/app/` via FTP separato.

**Prerequisito**: il backend deve essere già stato deployato (il catch-all deve esistere e funzionare, anche se restituisce redirect a frontend_url finché `public/app/` è vuoto).

---

## 1. CSP produzione

**Riferimenti**: C5
**Cosa fare**:

1. Modifica `frontend/index.html:53-61`:
   - **Rimuovi** i 2 blocchi CSP che contengono URL hardcoded `laravel.fritz.box:8080` e `laravel.fritz.box:8000`
   - **Sostituisci** con CSP per same-origin:
     ```html
     <meta http-equiv="Content-Security-Policy"
           content="script-src 'self' 'unsafe-inline'; connect-src 'self'; img-src 'self' data:; object-src 'self'">
     ```
   - **Rimuovi** il blocco CSP commentato alle righe 53-56 (codice morto)

2. Nota: `'unsafe-inline'` è necessario per Vite in dev e per alcuni pattern Vue. In produzione si potrebbe restringere con nonce/hash, ma è un refactoring separato (fuori scope). Il CSP attuale su x10hosting (same-origin) serve correttamente: `'self'` matcha `tobear.x10.mx` per script, `connect-src 'self'` permette `/api/*` relativi.

---

## 2. SW API caching fix

**Riferimenti**: C6
**Cosa fare**:

1. Modifica `frontend/vite.config.js:46-52`:
   - **Sostituisci** `urlPattern` da **funzione** a **stringa regex**:
     ```js
     urlPattern: /\/api\//,
     ```
   - Questo matcha qualsiasi request il cui URL contenga `/api/` (same-origin), che è il pattern corretto per same-host deployment.
   - Rimuovi l'intero closure (con `env.VITE_API_BASE_URL`) che causava `ReferenceError` in `dist/sw.js`.

2. Lascia `handler: 'NetworkFirst'` e le opzioni esistenti (cacheName, networkTimeoutSeconds, expiration). Sono corrette.

---

## 3. Base path

**Riferimenti**: A4
**Cosa fare**:

1. Modifica `frontend/vite.config.js:21`:
   - Cambia da `base: '/'` a:
     ```js
     base: env.VITE_BASE_URL || '/',
     ```

2. Verifica `frontend/.env.production`:
   - Deve contenere `VITE_BASE_URL=/app/` (con slash finale per Vite)
   - `VITE_API_BASE_URL=/api` (same-origin)

3. Verifica `frontend/public/prod_x10.manifest.webmanifest`:
   - `start_url` deve essere `/app/`
   - `scope` deve essere `/app/`
   - `lang` deve essere `"en"` (coerente con default locale i18n, non "it")

4. Nota: il canonical in `index.html:20` usa `%VITE_BASE_URL%` — Vite non sostituisce placeholder in index.html. Non bloccante per il deploy (è solo SEO), ma da tenere a mente.

---

## 4. viteCompression fix

**Riferimenti**: M10
**Cosa fare**:

1. Modifica `frontend/vite.config.js:84-85`:
   - Cambia da `algorithm: 'brotliCompress'` + `ext: '.gz'` a:
     ```js
     algorithm: 'gzip',
     ext: '.gz',
     ```
   - **Motivazione**: su shared hosting x10hosting, gzip è universale e supportato. Brotli richiede mod_brotli che potrebbe non essere presente. L'estensione `.gz` ora corrisponde all'algoritmo.

2. **Alternativa** (se preferisci brotli): `algorithm: 'brotliCompress'` + `ext: '.br'`, ma devi verificare che x10hosting supporti brotli.

---

## 5. Logout navigation fix

**Riferimenti**: A5
**Cosa fare**:

1. Modifica `frontend/src/components/MobileNavFab.vue:164`:
   - `router.push({ name: 'Home' })` → `router.push({ name: 'Todo' })`

2. Modifica `frontend/src/components/DesktopSidebar.vue:203`:
   - `router.push({ name: 'Home' })` → `router.push({ name: 'Todo' })`

---

## 6. Workflow GitHub — CI/CD

**Riferimenti**: M8 (frontend)
**Cosa fare**:

1. Modifica `.github/workflows/main.yml`:
   - **Conferma** che `VITE_BASE_URL=/app/` sia passato al build step (env)
   - **Aggiungi** `VITE_API_BASE_URL=/api` esplicito se non già presente
   - **Aggiungi** step E2E su build di produzione (opzionale, non bloccante):
     ```yaml
     - name: Run E2E tests on production build
       run: |
         npx serve dist -l 4173 &
         sleep 3
         npm run test:e2e:pwa
     ```
   - **Nota**: lo step E2E in CI richiede che `serve` sia installato (non in devDependencies). Aggiungi una riga `npx serve@latest` o installa `serve` come devDependency.

---

## 7. Documentazione

**Riferimenti**: A6
**Cosa fare**:

1. Modifica `frontend/AGENTS.md`:
   - **Header**: aggiorna stack table, correggi porta dev 3001/http (non 3000/https)
   - **Sezione "Architettura"**: rimuovi riferimenti a `GuestLayout`, `DefaultLayout`, `HomePage` (cancellati); `components/tailwindplus/` (cancellato); conferma `AppLayout` come unico layout
   - **Sezione "Convenzioni di progetto"**: "**Lingua**: stringe utente-facing gestite da **vue-i18n** con default `en` e fallback `en`. Backend produce messaggi in **inglese**. Non scrivere stringhe italiane hardcoded."
   - **Sezione "Comandi utili"**: correggi `npm run dev # vite dev server, host 0.0.0.0:3001, http`
   - **Sezione "Produzione"**: aggiorna con `VITE_BASE_URL=/app/`, `VITE_API_BASE_URL=/api`, deploy target = backend/public/app/

2. Modifica `frontend/TODO.md`:
   - Segna come `[x]` i fix eseguiti
   - Aggiorna sezione "Deploy x10hosting" con i nuovi valori

3. Modifica `frontend/.opencode/skills/tailwind-styling/SKILL.md`:
   - **Rimuovi** intera sezione che elenca componenti `tailwindplus/` (cancellati)
   - **Sostituisci** palette `bg-yellow-600`/`#8b5e3c` con riferimento al design system `tb-*` token
   - **Oppure**: se la skill non è più utile, eliminala (la responsabilità di stile è passata a `frontend-design` + `tb-*` tokens). Io raccomando di **rimuoverla** e aggiornare AGENTS.md di conseguenza.

---

## 8. Handoff + commit

1. Scrivi `frontend/handoffs/2026-07-06-hardening-build-pre-deploy.md`
   - Formato comando `/handoff`
   - Cosa è stato fatto
   - Stato attuale
   - Decisioni prese (same-origin CSP, SW urlPattern regex, base dinamica, gzip)
   - Prossimi passi (deploy frontend su x10hosting dopo backend, validazione PWABuilder)
   - Note per il backend (nessuna)

2. **Commit** in `frontend/` con messaggio Conventional Commits EN:
   ```
   fix: harden build and security for pre-production deploy
   
   - Fix CSP for same-origin deployment (remove hardcoded localhost URLs)
   - Fix SW API runtime caching (urlPattern regex instead of function with broken closure)
   - Fix base path to respect VITE_BASE_URL env variable
   - Fix viteCompression algorithm (gzip) matching extension (.gz)
   - Fix logout navigation (Home route no longer exists)
   - Update AGENTS.md, TODO.md, tailwind-styling skill
   - Add optional E2E step to CI
   ```
   Niente `git push` — lo fai tu.

---

## Note post-esecuzione

Dopo il commit del frontend, attivita rimanenti:

1. Tu: crea il secret `APP_KEY` nel repo backend GitHub
2. Tu: esegui `git push` su entrambi i repo
3. Tu: verifica il deploy su x10hosting
4. Phase 3: validazione post-deploy (da fare in sessione separata):
   - `GET /api/user` → 401
   - `GET /` → SPA funzionante
   - `GET /serverphpinfo` con/without `X-Debug-Token` → 404 / ok
   - SW registration + offline API caching
   - PWABuilder validation

---

**Fine piano frontend.** Il piano backend è in `backend/docs/plans/PLAN-hardening-2026-07-06.md`.
