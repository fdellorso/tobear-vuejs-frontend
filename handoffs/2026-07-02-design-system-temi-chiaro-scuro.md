# Handoff — 2026-07-02 — Design system, tema chiaro/scuro e migrazione colori tb-*

## Cosa è stato fatto

### Design system (CSS custom properties)
- **`src/assets/themes.css`** (nuovo) — 16 token CSS in due blocchi: tema scuro (`:root`/`[data-theme="dark"]`, default) e tema chiaro (`[data-theme="light"]`). Colori per bg, surface, surface-2, border, text (3 gradazioni), nav-active, accent, success, danger, warning con relativi bg.
- **`src/assets/themes.css`** — aggiunto blocco `@theme inline` con alias `--color-tb-*` che referenziano le custom properties, permettendo l'uso come classi Tailwind (`bg-tb-surface`, `text-tb-text`, ecc.).
- **`src/assets/style.css`** — import di `themes.css` prima di `tailwindcss`. Aggiunti `html, body { background-color: var(--color-bg); color: var(--color-text); }` per background globale theme-aware. Aggiunto `min-height` per coprire viewport.

### Theme store
- **`src/stores/theme.js`** (nuovo) — store Pinia con tre modalità: `light`, `dark`, `system` (default, segue preferenza OS). Persistenza su `localStorage` (chiave `tobear_theme`). Applica `data-theme` su `<html>` via `_applyTheme()`.
- **`src/main.js`** — import e init del tema dopo `app.use(pinia)`.

### Selettore tema
- **`src/components/DesktopSidebar.vue`** — tre bottoni icona (Sole/Luna/Monitor) nel footer della sidebar, con active state.
- **`src/components/MobileNavFab.vue`** — stesso selettore nel popover mobile, in fondo dopo i link auth.

### Migrazione colori hardcoded → `tb-*`
12 file migrati da classi `bg-gray-*`, `text-gray-*`, `border-gray-*`, `bg-white`, `bg-indigo-*`, `text-green-*`, `text-red-*`, `text-blue-*`, ecc. alle corrispondenti `bg-tb-*`, `text-tb-*`, `border-tb-*`:

- `DesktopSidebar.vue` — nav, stats, auth, selettore tema
- `TaskItem.vue` — card, drag handle, edit input focus ring, bottoni azione (complete/reinserisci/delete)
- `TodoPage.vue` — header task, input form, label completati, ghost drag class
- `MobileNavFab.vue` — popover panel, link nav, auth, selettore tema
- `DesktopContentPanel.vue` — aside, titolo, close button
- `AboutPage.vue`, `ContactPage.vue` — wrapper bg, min-h-screen
- `AboutContent.vue`, `ContactContent.vue` — testi, link, form inputs, messaggi errore/successo, submit button, GitHub link

### Fix specifici
- **`themes.css`**: aumentato contrasto `--color-surface` (#2e2c28) e `--color-border` (#3d3b35) nel tema scuro per migliorare leggibilità card/bordi.
- **`TaskItem.vue`**: bottoni azione desktop ora hanno `bg-tb-*-bg` sempre visibile (non solo hover), per coerenza con fondo card.
- **`ContactPage.vue`**: rimosso div decorativo blob/gradiente (blur-3xl con clip-path).
- **`DesktopSidebar.vue`**: About/Contatti ora fanno toggle (click chiude se già aperto).
- **`index.html`**: rimosso `class="h-full"` da `<html>` e `<body>` (gestito via CSS).

### UX desktop redesign (modifiche visive in Blocco 3)
- Sidebar: logo `size-14`→`size-9`, titolo `text-3xl font-bold`→`text-lg font-medium`.
- Nav: icone Heroicons (`CheckIcon`, `InformationCircleIcon`, `EnvelopeIcon`) prima di ogni label.
- TodoPage: header "I miei task" con contatore attivi, visibile solo su xl+.
- TaskItem: rimosso `font-bold` dal testo task (ora peso normale).

## Stato attuale
- **Tema funzionante**: `data-theme` su `<html>` cambia tra `"dark"` e `"light"`. Background globale, surface card, bordi, testi, accent, success/danger/warning colori reagiscono al tema. Selettore "Sistema" segue `prefers-color-scheme` via `matchMedia`.
- **Migrazione colori completa** per tutti i componenti principali e pagine About/Contact. Non migrati: `src/components/tailwindplus/` (scaffolding third-party, va lasciato intatto) e pagine auth (`LoginPage.vue`, `RegisterPage.vue`, `UserProfile.vue`, `UserSettings.vue`, `VerifyEmail.vue`).
- **Lint**: 52 errori pre-esistenti (markdown in AGENTS.md/TODO.md, unused var in PaginationElement) — zero nuovi.
- **Test**: 34/34 passati.
- **TODO.md**: nessuna voce segnata come completata in questa sessione (la sessione non ha toccato feature item della checklist — è stata puramente infrastrutturale/refactoring).

## Decisioni prese
- **`@theme inline` invece di Tailwind config**: sfrutta Tailwind v4 nativo, genera classi `bg-tb-*`, `text-tb-*`, `border-tb-*` automaticamente senza configurazione extra. Usa `var(--color-tb-*)` come alias delle CSS custom properties.
- **Tema scuro come default**: `:root` è tema scuro, il blocco `[data-theme="dark"]` è un alias. Il tema chiaro è solo `[data-theme="light"]`. Questo evita flash di colore bianco al load su browser che non supportano `prefers-color-scheme` (nessun JS necessario per il default).
- **Modalità "system" come default nello store**: l'utente medio non vuole scegliere un tema — segue le impostazioni OS. Chi vuole fissare chiaro/scuro può usare il selettore.
- **Rimosso blob decorativo da ContactPage**: era scaffolding Tailwind Plus (gradiente rosa/viola), non coerente con lo stile Clear/toBear.
- **Bottoni About/Contatti toggle**: comportamento più prevedibile — se il pannello è già aperto, click lo chiude invece di tenerlo aperto (pattern drawer laterale standard).

## Prossimi passi
1. **Verifica visiva**: aprire `https://laravel.fritz.box:3000/todo`, testare cambio tema in sidebar e FAB mobile, verificare che tutti i componenti principali reagiscano correttamente al tema chiaro.
2. **Migrare pagine auth** (LoginPage, RegisterPage, UserProfile, UserSettings, VerifyEmail) al design system tb-* — sono ancora con classi hardcoded `text-gray-*`, `bg-white`, `bg-indigo-*`, ecc.
3. **TODO.md #15-16**: UX desktop hover-reveal buttons — verificare completezza (esistono già, ma va testata coerenza su temi).
4. **TODO.md #18**: HomePage.vue — decidere se recuperare o rimuovere.
5. **Meta theme-color**: aggiornare `<meta name="theme-color" content="#8b5e3c">` in `index.html` per cambiare dinamicamente con il tema (usa `var(--color-accent)` o aggiorna via JS nello store tema).
6. **Scrivere test Vitest per TaskItem.vue** (swipe, editing, long-press) — voce aperta da handoff precedente.

## Note per il backend
- Nessuna richiesta di modifica API in questa sessione.

## File rilevanti
- `src/assets/themes.css` — token CSS + @theme inline alias tb-*
- `src/stores/theme.js` — store Pinia tema con init/setTheme/_applyTheme
- `src/main.js` — init tema dopo Pinia
- `src/assets/style.css` — import themes.css, bg/text globali, min-height
- `index.html` — rimosso class="h-full"
- `src/components/DesktopSidebar.vue` — logo rimpicciolito, nav con icone, selettore tema, toggle pannello
- `src/components/MobileNavFab.vue` — selettore tema nel popover
- `src/components/TaskItem.vue` — font bold rimosso, bottoni azione con bg sempre visibile, focus ring accent
- `src/pages/TodoPage.vue` — header "I miei task", input border tb-border
- `src/components/DesktopContentPanel.vue` — border/sfondo tb-*
- `src/pages/AboutPage.vue`, `src/pages/ContactPage.vue` — bg-tb-bg, min-h-screen, blob rimosso
- `src/components/AboutContent.vue`, `src/components/ContactContent.vue` — tutti i colori migrati a tb-*
