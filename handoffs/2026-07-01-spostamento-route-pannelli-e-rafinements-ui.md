# Handoff — 2026-07-01 — Spostamento route About/Contact, pannello destro, scroll e raffinements UI

## Cosa è stato fatto

### Router: About e Contact spostati da GuestLayout ad AppLayout
- **src/router/index.js** — le route `/about` e `/contact` sono state spostate dal gruppo `GuestLayout` al gruppo `AppLayout`. Il path del gruppo AppLayout è cambiato da `'/todo'` a `'/'` con children a `/todo`, `/about`, `/contact`.
- Il redirect `{ path: '/', redirect: '/todo' }` resta invariato (non causa conflitti perché dichiarato prima).

### Pannello destro contestuale (xl+)
- **src/views/AppLayout.vue** — aggiunto `watch()` su `route.path` che su xl+ (≥1280px) cattura `/about` e `/contact`, apre il `DesktopContentPanel` con `activePanel = 'about'|'contact'` e redirige a `/todo`. Aggiunto listener `resize` per chiudere il pannello se la finestra scende sotto xl.
- **src/components/DesktopSidebar.vue** — aggiunto link "Todo" come prima voce della nav (RouterLink a `/todo`, active state `bg-gray-200 text-gray-900` quando `route.path === '/todo'`). Aggiunto `useRoute()`.

### Scroll sidebar e colonna centrale
- **AppLayout.vue** — colonna centrale ora scrollabile su xl+ (`xl:overflow-y-auto xl:h-full`), scrollbar nascosta via `[scrollbar-width:none]` + `[&::-webkit-scrollbar]:hidden` (su xl).
- **DesktopSidebar.vue** — div superiore reso `flex-1 min-h-0 overflow-y-auto` per cedere spazio al div inferiore (login/logout). Scrollbar nascosta stesso pattern.
- **DesktopContentPanel.vue** — scrollbar nascosta stesso pattern.

### Spostamento form nuovo task
- **src/pages/TodoPage.vue** — il form di inserimento nuovo task è stato spostato da dopo la sezione "Completati" a subito dopo il draggable degli active tasks (prima dei completati). Ordine attuale: active tasks → form → completati.

### Task completati: bottone "Reinserisci"
- **src/components/TaskItem.vue** — aggiunta prop `completed` (boolean, default false). Quando `completed` è true, il bottone hover nel gruppo desktop mostra un'icona freccia circolare arancione (path ArrowPath di Heroicons) con title "Reinserisci" invece della spunta verde "Completa".
- **src/pages/TodoPage.vue** — passato `:completed="task.completed"` al TaskItem nella sezione completati.

### Padding ridotto pagine About/Contact
- **src/pages/AboutPage.vue** e **src/pages/ContactPage.vue** — padding verticale ridotto: `py-24 sm:py-32` → `py-8`.

### Logo più grande + ombra
- **src/components/MobileNavFab.vue** — PopoverButton: aggiunto `rounded-full shadow-lg`. LogoIcon: `size-12` → `size-14`.
- **src/components/DesktopSidebar.vue** — LogoIcon: `size-12` → `size-14`. Titolo: `text-lg font-semibold` → `text-3xl font-bold`.
- **src/components/LogoIcon.vue** — quando `noBorder=true`, aggiunto `shadow-lg` (prima non c'era ombra). `noBorder=false` resta `shadow-xl` con bordo ambrato.

### Guest: "Modalità locale" in sidebar
- **src/components/DesktopSidebar.vue** — sotto `mode === 'guest'`, prima del link Accedi, aggiunto testo informativo "Modalità locale — crea un account per sincronizzare i task."

## Stato attuale

- **Routing pubblico**: `/about` e `/contact` ora usano `AppLayout`. Su xl+ atterrano nel pannello destro, su mobile/tablet navigano normalmente.
- **Scroll**: sidebar, colonna centrale e pannello destro scrollano indipendentemente su xl+; scrollbar nascoste (funzionano ma invisibili).
- **Form nuovo task**: ora tra active tasks e completati — UX più naturale (scrivi subito, completati sotto).
- **Task completati**: mostrano icona "reinserisci" arancione; cliccando si riportano tra gli attivi.
- **Tutto lint pulito** (zero nuovi errori oltre ai 46 pre-esistenti in markdown/PaginationElement).
- **Test**: 34/34 passati.

## Decisioni prese

- **About/Contact come pannello laterale su desktop** — scelta per sfruttare lo spazio orizzontale senza navigazione a pagina intera. Su mobile resta navigazione normale (full page).
- **Scrollbar nascoste** — scelta estetica deliberata (stile Clear), scroll funzionante. Implementato con `scrollbar-width:none` + `::-webkit-scrollbar:hidden` cross-browser.
- **Form task tra active e completed** — posizione più naturale: l'utente vede i task attivi, può aggiungerne uno subito, e sotto trova i completati. Prima il form era sotto i completati, poco scopribile.

## Prossimi passi

1. **Avviare dev server e testare visivamente** — verificare scroll sidebar/colonna centrale, pannello destro About/Contact su xl+, form task in nuova posizione, bottone reinserisci.
2. **Completare TODO.md voce #15-16** (UX Desktop hover-reveal) — il bottone complete/delete esiste già nel gruppo hover desktop, ma manca verifica che l'interazione sia completa e coerente.
3. **TODO.md #14** (Homepage) — codice HomePage.vue esiste ma non referenziato da route. Decidere se recuperare o rimuovere definitivamente.
4. **Backend route `/v1/contact`** — non ancora verificata contro il backend toBear (repo separato). Da testare end-to-end.

## Note per il backend

- Nessun nuovo endpoint o campo richiesto in questa sessione.
- `POST /v1/contact` è già atteso dal frontend (ContactContent.vue) — verificare che esista nel backend con rate limiting (429) già implementato.
- Nelle route spostate non c'è impatto backend: `/about` e `/contact` sono solo pagine statiche frontend; il form contact chiama `POST /v1/contact` già esistente.

## File rilevanti

- `src/router/index.js` — route About e Contact spostate da GuestLayout ad AppLayout
- `src/views/AppLayout.vue` — watch route, scroll colonna centrale, scrollbar nascoste
- `src/components/DesktopSidebar.vue` — link Todo, logo/titolo più grandi, modalità locale, scrollbar
- `src/components/DesktopContentPanel.vue` — scrollbar nascoste
- `src/components/TaskItem.vue` — prop `completed`, bottone reinserisci
- `src/components/MobileNavFab.vue` — logo size-14, ombra
- `src/components/LogoIcon.vue` — shadow-lg su noBorder=true
- `src/pages/TodoPage.vue` — form spostato prima dei completati, `:completed` prop
- `src/pages/AboutPage.vue` — padding ridotto
- `src/pages/ContactPage.vue` — padding ridotto
