# Frontend — Fix post-validazione 2026-07-07

**Repo**: `frontend/`
**Scope**: fix critici e medi emersi dalla validazione post-deploy su x10hosting
**Base**: `VALIDATION-2026-07-07.md` (root `todos_app/`)
**Architettura di deploy**: same-host, `dist/` deployato in `backend/public/app/`

---

## 1. Fix cspDynamicPlugin regex — 🔴 CRITICO

**Riferimenti**: C1 (critico), B5, D6, E2, E3 (VALIDATION-2026-07-07.md)
**Cosa fare**:

1. Modifica `vite.config.js:33-35` (funzione `cspDynamicPlugin`, metodo `transformIndexHtml`):

   - **Regex attuale** (buggata — matcha TROPPO):
     ```js
     return html.replace(
       /<meta[\s\S]*?http-equiv="Content-Security-Policy"[\s\S]*?\/?>/i,
       `<meta http-equiv="Content-Security-Policy" content="${csp}">`
     )
     ```

   - **Regex fixata** (matcha SOLO il meta CSP tag):
     ```js
     return html.replace(
       /<meta\s+http-equiv="Content-Security-Policy"[^>]*>/i,
       `<meta http-equiv="Content-Security-Policy" content="${csp}">`
     )
     ```

2. **Spiegazione del bug**:
   - `[\s\S]*?` lazy matcha qualsiasi carattere (incluso `>`) ma si ferma al primo match successivo.
   - La regex parte dal **primo `<meta`** nell'HTML (che è `<meta charset="UTF-8" />`) e matcha lazy attraverso tutti i tag successivi fino al meta CSP.
   - `\/?>` finale matcha il `>` del meta CSP.
   - **Risultato**: il replace rimpiazza TUTTO da `<meta charset...` fino al `/>` del CSP, cioè **tutti i tag intermedi**:
     - `<link rel="manifest">` → rimosso
     - `<meta name="viewport">` → rimosso
     - `<meta name="theme-color">` → rimosso
     - `<link rel="icon">`, `<link rel="apple-touch-icon">` → rimossi
     - ... e tutti gli altri meta/link fino al CSP

   - **Fix**: `[^>]*` matcha qualsiasi carattere **tranne `>`**, limitandosi al singolo tag meta CSP. Il tag è su più righe? `[^>]` include i newline, quindi matcha su più righe. Non c'è `[^>]` include newline. Il tag CSP è su 3 righe nell'index.html, `[^>]*` lo matcha correttamente.

3. **Verifica**: dopo il build, l'HTML prodotto in `dist/index.html` deve contenere:
   ```html
   <link rel="manifest" href="/app/manifest.webmanifest" type="application/manifest+json" />
   <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes" />
   <meta name="theme-color" content="#8b5e3c" />
   <link rel="icon" href="/app/img/icons/icon-32x32.png" sizes="32x32" />
   <link rel="apple-touch-icon" href="/app/img/icons/icon-180x180.png" />
   ```
   (I path potrebbero differire in base al fix #2)

---

## 2. Fix path assoluti in index.html

**Riferimenti**: B5, D6 (VALIDATION-2026-07-07.md)
**Cosa fare**:

1. Modifica `index.html` righe 7-18, 43:

   I path assoluti attuali (`/manifest.webmanifest`, `/favicon.ico`, `/favicon.svg`, `/icon.svg`, `/img/icons/*`, `/browserconfig.xml`) **non vengono riscritti** da Vite con `base: '/app/'`. Vite riscrive solo script module e CSS href. Per gli altri tag, il path rimane assoluto alla root → il browser richiede `https://tobear.x10.mx/favicon.ico` invece di `https://tobear.x10.mx/app/favicon.ico` → 404 o SPA HTML.

   **Fix**: cambia tutti i path assoluti in **relativi** (senza `/` iniziale):

   ```html
   <!-- Prima: assoluti -->
   <link rel="manifest" href="/manifest.webmanifest" type="application/manifest+json" />
   <link rel="icon" href="/favicon.ico" />
   <link rel="mask-icon" href="/favicon.svg" color="#FFFFFF" />
   <link rel="icon" href="/icon.svg" type="image/svg+xml" />
   <link rel="icon" href="/img/icons/icon-32x32.png" sizes="32x32" />
   <link rel="icon" href="/img/icons/icon-16x16.png" sizes="16x16" />
   <link rel="apple-touch-icon" href="/img/icons/icon-180x180.png" />
   <meta name="msapplication-config" content="/browserconfig.xml" />

   <!-- Dopo: relativi -->
   <link rel="manifest" href="manifest.webmanifest" type="application/manifest+json" />
   <link rel="icon" href="favicon.ico" />
   <link rel="mask-icon" href="favicon.svg" color="#FFFFFF" />
   <link rel="icon" href="icon.svg" type="image/svg+xml" />
   <link rel="icon" href="img/icons/icon-32x32.png" sizes="32x32" />
   <link rel="icon" href="img/icons/icon-16x16.png" sizes="16x16" />
   <link rel="apple-touch-icon" href="img/icons/icon-180x180.png" />
   <meta name="msapplication-config" content="browserconfig.xml" />
   ```

2. **Motivazione**: i path relativi si risolvono rispetto alla base URL corrente (con `base: '/app/'`, la base è `/app/`). Per le route top-level della SPA (`/app/todo`, `/app/about`, `/app/contact`), una risorsa relativa `manifest.webmanifest` risolve a `/app/manifest.webmanifest` ✓. Non ci sono route annidate (nessun `/app/todo/123`), quindi non c'è rischio di path relativi che risolvono male.

   **Alternativa**: usare path `/app/...` esplicitamente. Sconsigliato perché hardcoding del subpath. I path relativi sono DRY.

3. **Nota**: il tag `<link rel="canonical" href="%VITE_BASE_URL%" />` alla riga 20 usa `%VITE_BASE_URL%`. Vite **non sostituisce** placeholder in index.html (il canonical è decorativo, non bloccante). Non modificare.

4. **Verifica**: dopo il build, l'HTML servito deve avere path corretti. Verificare con `grep`:
   ```bash
   grep -o 'href="[^"]*"' dist/index.html
   # Deve mostrare path relativi o /app/ prefissati
   ```

---

## 3. Lazy loading router

**Riferimenti**: C2, G3 (VALIDATION-2026-07-07.md)
**Cosa fare**:

1. Modifica `src/router/index.js:5-16`:

   - **Rimuovi** gli import eager per le pagine secondarie (tutti tranne `AppLayout`):
     ```js
     // DA RIMUOVERE (sostituire con lazy import):
     import LoginPage from '@/pages/LoginPage.vue'
     import RegisterPage from '@/pages/RegisterPage.vue'
     import VerifyEmail from '@/pages/VerifyEmail.vue'
     import PremiumPage from '@/pages/PremiumPage.vue'
     import AboutPage from '@/pages/AboutPage.vue'
     import ContactPage from '@/pages/ContactPage.vue'
     import TodoPage from '@/pages/TodoPage.vue'
     import UserProfile from '@/pages/UserProfile.vue'
     import UserSettings from '@/pages/UserSettings.vue'
     import NotFound from '@/pages/NotFound.vue'
     ```

   - **Mantieni eager** solo `AppLayout` (sempre necessario, usato da tutte le route):
     ```js
     import AppLayout from '@/views/AppLayout.vue'
     ```

   - **Sostituisci** nei route le `component` con `component: () => import(...)`:
     ```js
     children: [
       {
         path: '/todo',
         name: 'Todo',
         meta: { showInNav: true },
         component: () => import('@/pages/TodoPage.vue'),
       },
       {
         path: '/about',
         name: 'About',
         meta: { requiresAuth: false, showInNav: true },
         component: () => import('@/pages/AboutPage.vue'),
       },
       {
         path: '/contact',
         name: 'Contact',
         meta: { requiresAuth: false, showInNav: true },
         component: () => import('@/pages/ContactPage.vue'),
       },
       // ... e così via per tutte le altre pagine
     ]
     ```

2. **Motivazione**: attualmente tutte le pagine sono import eager, risultando in un bundle unico di **520KB**. Con il lazy loading, Vite genera chunks separati per ogni pagina. Il chunk principale (core Vue + AppLayout + router + shared code) dovrebbe essere < 300KB. Le pagine secondarie (About, Contact, Login, Register, ecc.) vengono caricate on-demand al primo accesso.

3. **Nota**: `TodoPage.vue` è la pagina principale più visitata. Potrebbe restare eager per UX, ma con `() => import(...)` e Webpack/Vite dynamic imports, Vite pre-caricherà il chunk se rilevato come modulo di percorso comune. Per minimizzare il bundle iniziale, lazy-loadare anche TodoPage. Il chunk verrà comunque caricato quasi immediatamente (router redirect `/` → `/todo`).

   **Opzionale**: se vuoi tenere TodoPage eager per velocizzare il render iniziale, mantieni l'import:
   ```js
   import TodoPage from '@/pages/TodoPage.vue'
   ```
   Bundle iniziale sarà leggermente più grande ma il primo render più veloce.

4. **Verifica**: dopo il build:
   ```bash
   ls -la dist/assets/*.js
   # Dovresti vedere: index-[hash].js (chunk principale ~300KB o meno)
   #                AboutPage-[hash].js (~XKB)
   #                ContactPage-[hash].js (~XKB)
   #                ecc.
   ```

---

## 4. Handoff + commit

1. Scrivi `frontend/handoffs/2026-07-07-fix-post-validazione.md`
   - Formato comando `/handoff`
   - Cosa è stato fatto (3 fix)
   - Stato attuale (lint 0 errori, build OK, bundle ridotto)
   - Decisioni prese (regex cspDynamicPlugin, path relativi, lazy loading)
   - Prossimi passi (push, redeploy, validazione PWABuilder post-fix)
   - Note per il backend (nessuna — nessun cambiamento API)

2. **Commit** in `frontend/` con messaggio Conventional Commits EN:
   ```
   fix: resolve post-deploy validation issues

   - Fix cspDynamicPlugin regex (restore manifest/viewport/favicon meta tags)
   - Fix absolute paths in index.html (use relative for /app/ subpath)
   - Add lazy loading for secondary routes (reduce initial bundle)
   ```
   Niente `git push` — lo fai tu.

---

**Fine piano frontend.**
