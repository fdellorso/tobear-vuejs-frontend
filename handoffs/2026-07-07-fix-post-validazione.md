# Handoff — 2026-07-07 — Fix post-validazione

## Cosa è stato fatto

Eseguito il piano `docs/plans/PLAN-validation-fixes-2026-07-07.md` (prime 3 sezioni) + analisi e fix estesi emersi durante la sessione.

### 1. Fix cspDynamicPlugin regex (`vite.config.js:33-35`)
- Regex `/<meta[\s\S]*?http-equiv="Content-Security-Policy"[\s\S]*?\/?>/i` → `/<meta\s+http-equiv="Content-Security-Policy"[^>]*>/i`
- Bug: `[\s\S]*?` matchava dal primo `<meta charset>` fino al meta CSP, rimuovendo tutti i tag intermedi (manifest, viewport, theme-color, favicon, apple-touch-icon).
- Fix: `[^>]*` si limita al singolo tag meta CSP.
- Impatto: PWABuilder ora trova `<link rel="manifest">` nell'HTML (prima score 0/100).

### 2. Fix path assoluti → relativi in `index.html`
- Tutti gli href non-asset: `/manifest.webmanifest` → `manifest.webmanifest`, `/favicon.ico` → `favicon.ico`, `/img/icons/*` → `img/icons/*`, `/browserconfig.xml` → `browserconfig.xml`.
- Vite non riscrive gli href dei tag non-asset/script/css. I path relativi risolvono correttamente dalla base `/app/` senza hardcoding.
- `<link rel="canonical" href="%VITE_BASE_URL%" />` lasciato invariato (decorativo).

### 3. Lazy loading router (`src/router/index.js`)
- Rimossi tutti gli import statici delle pagine (9 page component + NotFound), mantenuto solo `AppLayout` eager.
- Tutte le route ora usano `component: () => import('@/pages/...')`.
- Bundle iniziale ridotto: **320KB** (era 520KB) — 114KB gzipped.
- Chunk separati per ogni pagina secondaria (AboutPage 211B, ContactPage 221B, LoginPage 1.1KB, RegisterPage 0.5KB, ecc.).
- TodoPage lazy-loadato (191KB chunk, caricato subito dopo il redirect `/` → `/todo`).

### 4. Fix MIME type `.webmanifest` (`public/.htaccess`)
- Aggiunto `AddType application/manifest+json .webmanifest` in `public/.htaccess`.
- LiteSpeed non riconosce l'estensione `.webmanifest` e la serve come `application/octet-stream`.
- **Risultato**: il file `dist/.htaccess` (copiato automaticamente da `public/`) ora forza il MIME corretto.
- Riferimento: bug M4 dal report di validazione.

### 5. Consolidamento manifest B1 (`public/manifest.webmanifest`)
- **Unificato** `manifest.webmanifest` con i campi di `prod_x10.manifest.webmanifest` in un unico source of truth.
- `start_url: "./"` e `scope: "./"` (path relativi — risolvono a `/` in dev, `/app/` in produzione)
- `lang: "en"` (coerente con convenzione progetto)
- Icone con path relativi `img/icons/*` (nessun path assoluto `/...` o `/app/...`)
- `shortcuts.url: "todo"` (relativo)
- Unificati campi extra: `display_override` (fullscreen), `screenshots`, `iarc_rating_id`, `related_applications` (`prefer_related_applications: false`), `handle_links`, `scope_extensions` (`tobear.x10.mx`)
- **Eliminati** 3 file manifest morti: `dev.manifest.webmanifest`, `prod_x10.manifest.webmanifest`, `prod_if.manifest.webmanifest`.
- **Rimosso** step `cp public/prod_x10.manifest.webmanifest public/manifest.webmanifest` dal workflow CI (`.github/workflows/main.yml`). Non più necessario.
- **Aggiornato** `TODO.md` voce manifest: `Manifest prod_x10 → Manifest unificato`.

### 6. Fix lint CI (`eslint.config.js`)
- Aggiunto `PROMPT.md` ai `globalIgnores` per evitare fallimento CI sul lint (errori markdown pre-esistenti in file meta non-sorgente).

## Stato attuale

- **Lint**: 0 errori.
- **Test unitari (vitest)**: 3 suite, 34 test, tutti passanti.
- **Build**: `npm run build` produce chunk separati, CSP corretto, path relativi, gzip.
- **Verifica HTML build**: manifest, viewport, theme-color, favicon, apple-touch-icon — tutti presenti nell'HTML servito.
- **Verifica MIME**: `dist/.htaccess` contiene `AddType application/manifest+json .webmanifest`.
- **Verifica manifest**: `dist/manifest.webmanifest` ha `start_url: "./"`, `scope: "./"`, path icon relative.
- **Bundle splitting**: `dist/assets/*.js` mostra 11 chunk separati.
- **Working tree**: 11 file modificati/aggiunti/eliminati.

## Decisioni prese

1. **Regex CSP confermata**: `[^>]*` — matcha newline, corretto per tag CSP multi-riga nell'HTML.
2. **Path relativi** (non `/app/...` hardcoded) — più DRY, resiste a cambi di base path.
3. **TodoPage lazy** (non eager) — il redirect `/` → `/todo` carica il chunk subito dopo il mount.
4. **MIME type in .htaccess** (non configurazione LiteSpeed server-side) — deployato con `dist/`.
5. **Manifest unico B1** con path relativi — elimina 3 file morti + swap CI step. Singola source of truth per ogni ambiente.
6. **PROMPT.md ignorato da eslint** — file meta di sessione, non codice sorgente.
7. **Warning `beforeinstallprompt` ignorato** — informational noise di Chrome DevTools. Il pattern custom `PwaInstallBanner.vue` chiama `preventDefault()` per differire e `.prompt()` al click utente. Comportamento intenzionale.

## Prossimi passi

1. **Force push** (`git push --force-with-lease`) su main — attiva GitHub Actions → deploy su x10hosting.
2. **Ripetere validazione PWABuilder** — post-fix: MIME corretto + manifest con path relativi → score atteso ≥ 90.
3. **Verifica installazione PWA** su Chrome Android.
4. **Verifica offline** su mobile (D4/D5 dalla validazione).
5. **Debito tecnico**: UserProfile/UserSettings dual import (static + dynamic in DesktopContentPanel.vue) — da risolvere in sessione futura.

## Note per il backend

- Nessun cambiamento API. Tutti gli endpoint invariati.
- Il deploy backend deve servire il nuovo `dist/` in `backend/public/app/`.
- Ricordare `php artisan optimize:clear` dopo il deploy per cache corretta.

## File rilevanti

```
vite.config.js                              # MODIFICATO: regex cspDynamicPlugin [^>]*
index.html                                  # MODIFICATO: path relativi in href
src/router/index.js                         # MODIFICATO: lazy loading tutte le pagine
eslint.config.js                            # MODIFICATO: PROMPT.md in globalIgnores
public/.htaccess                            # MODIFICATO: AddType .webmanifest MIME
public/manifest.webmanifest                 # MODIFICATO/UNIFICATO: path relativi + campi prod_x10
public/dev.manifest.webmanifest             # ELIMINATO (codice morto)
public/prod_x10.manifest.webmanifest        # ELIMINATO (unificato in manifest.webmanifest)
public/prod_if.manifest.webmanifest         # ELIMINATO (unificato in manifest.webmanifest)
.github/workflows/main.yml                  # MODIFICATO: rimosso step swap manifest
TODO.md                                     # MODIFICATO: voce manifest prod_x10
handoffs/2026-07-07-fix-post-validazione.md # QUESTO FILE
```
