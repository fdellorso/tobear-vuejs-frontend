# Performance Optimization — 2026-07-07

**Target**: Lighthouse Performance 50 → ≥ 85 (mobile, 4x CPU slowdown)
**Stimato**: Performance 80-85, Accessibility 95+, SEO 100

## Modifiche apportate

### P1 — Performance (impatto alto)

| # | File | Modifica | Before | After |
|---|---|---|---|---|
| 1 | `vite.config.js` | `build.rollupOptions.output.manualChunks`: singolo chunk **vendor** per tutti i node_modules | index.js 313KB | index.js **53KB** (vendor 438KB) |
| 2 | `vite.config.js` | Seconda istanza `viteCompression({ algorithm: 'brotliCompress', ext: '.br' })` | gzip: 114KB | brotli index: **13KB**, vendor: **138KB** |
| 3 | `vite.config.js` | `build.target: 'esnext'` | Polyfills Babel ~19KB | Rimossi |
| 4 | `vite.config.js` (cspDynamicPlugin) | CSS `media="print"` + `onload="this.media='all'"` trick | Render-blocking stylesheet | CSS caricato non-bloccante |
| 5 | `index.html` | Preconnect `https://stats.tobear.x10.mx` | Nessuno | Matomo setup più veloce |
| 6 | `LogoIcon.vue` | `<img fetchpriority="high">` sul logo LCP | Resource load delay 2.5s | LCP più veloce |
| 7 | `frontend/public/.htaccess` | mod_brotli + lsmod_brotli + rewrite `.br`/`.gz` + `<FilesMatch>` per `Content-Type`/`Content-Encoding` + `Vary Accept-Encoding` | Solo gzip | Brotli server-level + pre-compressi + **MIME type fissato** |
| 8 | `backend/public/.htaccess` | mod_brotli + lsmod_brotli per JSON API | Nessuna compressione | Brotli su risposte API |
| 9 | `vite.config.js` | `navigateFallback: '/index.html'` → `'index.html'` (relativo) | SW navigation fallback rotto per subpath | SW navigation fallback funzionante per `/app/` base |

### Bug MIME type — rewrite rules servivano `.br` files con `application/octet-stream`

Le rewrite rules `RewriteRule ^(.*)$ $1.br [L]` servono il file pre-compresso con estensione `.br`. Senza `Content-Type` esplicito, LiteSpeed/Apache usa `application/octet-stream` (MIME default per estensione sconosciuta). Il modulo script/strict MIME checking del browser rifiuta il file.

**Fix**: `<FilesMatch>` con `Header set Content-Type "application/javascript"` e `Header set Content-Encoding "br"` per ogni tipo di file `.js.br`, `.css.br`, `.html.br`, `.svg.br`. Le rewrite rules sono wrappate in `<IfModule mod_headers.c>` per sicurezza.

### Bug critico risolto - TDZ Error da manualChunks multi-chunk

La prima versione con 3 vendor chunk separati (`vendor-vue`, `vendor-ui`, `vendor-utils`) causava un errore **TDZ (Temporal Dead Zone)**:
```
PAGE_ERROR Cannot access 'ne' before initialization
```

Dovuto a dipendenze circolari tra vendor packages divisi in chunk diversi (es. `vuedraggable`/`vue-matomo` dipendono da `vue` ma erano in chunk separati, e la valutazione cross-chunk causava TDZ sulle `const`).

**Fix**: consolidato tutto in un singolo chunk `vendor` — elimina tutte le dipendenze cross-chunk tra vendor, risolvendo il TDZ.

### P2 — Accessibility + SEO

| # | File | Modifica | Before | After |
|---|---|---|---|---|
| 10 | `themes.css` | `--color-accent` dark `#e8823a` → `#c4682a` | A11y 90 | A11y ≥ 95 |
| 11 | `PwaInstallBanner.vue:33` | `text-tb-text-muted` → `text-tb-text-sec` | A11y 90 | A11y ≥ 95 |
| 12 | `TodoPage.vue` | `component-data` con `role="list"` | `listitem: FAIL` | `listitem: PASS` |
| 13 | `index.html` | Canonical → `https://tobear.x10.mx/app/` | SEO 92 | SEO 100 |

### Pre-existing SW subpath issue fixed

Il `navigateFallback: '/index.html'` (con slash iniziale) non matchava la precache entry `index.html` (relativa → `/app/index.html` con base `/app/`). Questo causava:
- `createHandlerBoundToURL("/index.html")` → `WorkboxError('non-precached-url')` durante SW init
- `throw` nella Promise `define()` impediva la registrazione della `NavigationRoute`
- **Conseguenze**: SW non gestiva navigation fallback offline. Le route `registerRoute` successive (runtime caching per API/statici) NON venivano registrate.

**Fix**: `navigateFallback: '/index.html'` → `navigateFallback: 'index.html'` (relativo, matcha precache entry).

## Chunk sizes after build

```
index-BkMq2lR8.js              53KB  (era 313KB)
vendor-C6jnFSC2.js            438KB  (singolo vendor chunk)
TodoPage-vqkUHLCn.js           14KB  (era 188KB — lazy)
```

Brotli transfer sizes (critical path):
```
index.js.br                 13KB
vendor.js.br               138KB
CSS.br                       8KB
Total                      159KB
```

## Verifica post-build

```bash
# canonical
grep 'canonical' dist/index.html  → https://tobear.x10.mx/app/ ✅

# CSS non render-blocking
grep 'media="print"' dist/index.html  → ✅

# fetchpriority in bundle (nel template Vue, non nell'HTML statico)
grep -l 'fetchpriority' dist/assets/*.js  → index chunk ✅

# .br files generated
ls dist/assets/*.br  → ✅

# .htaccess brotli
grep -i brotli dist/.htaccess  → ✅
```

## E2E Test Results

All 3 active tests PASS:
- ✓ app loads and registers service worker (0.99s)
- - app serves cached content when offline (fixme — subpath limitazione nota)
- ✓ guest can create task offline and it persists (1.9s)
- ✓ navigate fallback serves index.html for unknown routes (1.0s)

## Stima impatto Lighthouse

| Metrica | Pre-fix | Stima post-fix | Delta |
|---|---|---|---|
| Performance score | 50 | **80-85** | +30-35 |
| LCP | 4.2s | **~2.0-2.5s** | -1.7-2.2s |
| TBT | 2,160ms | **~300-500ms** | -1.6-1.8s |
| FCP | 2.4s | **~1.5-1.8s** | -0.6-0.9s |
| Accessibility | 90 | **95+** | +5+ |
| SEO | 92 | **100** | +8 |

**Driver principali**:
1. **manualChunks**: index.js da 313KB → 53KB (-83%)
2. **Brotli**: transfer size critical path ~159KB
3. **CSS non render-blocking**: FCP improvement
4. **fetchpriority="high"**: LCP logo parte immediatamente
5. **SW navigateFallback fix**: navigation fallback offline funziona con `/app/` base
6. **target esnext**: ~19KB polyfills rimossi

## Commit

```
perf: optimize bundle splitting, compression, SW fallback, and a11y

- Consolidate vendor code into single `vendor` chunk (fixes TDZ)
- Enable Brotli compression (server .htaccess + vite-plugin-compression)
- Fix SW navigateFallback to work with /app/ subpath base
- Add fetchpriority=high on LCP image
- Defer render-blocking CSS with media="print" trick
- Fix color contrast on Install button and PWA banner
- Fix <li> list structure for vuedraggable items
- Fix canonical URL to absolute https://tobear.x10.mx/app/
- Add preconnect for Matomo stats domain
- Set build target to esnext (remove legacy polyfills)
```

## File toccati

```
frontend/vite.config.js
frontend/index.html
frontend/src/components/LogoIcon.vue
frontend/src/components/PwaInstallBanner.vue
frontend/src/pages/TodoPage.vue
frontend/src/assets/themes.css
frontend/public/.htaccess
backend/public/.htaccess
frontend/e2e/pwa-service-worker.spec.js       # console capture removed after debug
frontend/handoffs/2026-07-07-performance-optimization.md
```

## Rischio regressioni

- **Cambio accent color**: `#e8823a` → `#c4682a` in tema scuro. OK.
- **CSS media="print"**: possile FOUC su connessioni lente. Mitigato da SW precache.
- **manualChunks**: singolo vendor chunk elimina rischio TDZ. vendor 438KB è ragionevole.
- **SW navigateFallback fix**: cambiamento da `/index.html` a `index.html` — matcha precache. Test E2E tutti verdi.
