# Handoff — 2026-06-30 — Redesign desktop: layout 3 colonne, sidebar sinistra, pannello destro

## Cosa è stato fatto

### Nuovi componenti (5)
- **`src/composables/useTaskStats.js`** — composable che fetcha `GET /v1/tasks` e restituisce `taskCount` e `completedCount`. Usa `axiosClient` con la stessa logica che era inline in `UserProfile.vue` (solo per utenti autenticati, conteggio totale + completati).
- **`src/components/AboutContent.vue`** — contenuto testuale della pagina About (estratto da AboutPage.vue, stesso identico markup, nessuna logica JS). Riutilizzabile sia come pagina intera che come embed nel pannello destro.
- **`src/components/ContactContent.vue`** — form contatto con logica (ref, validazione, `handleSubmit` con `withCSRF` + `POST /v1/contact`). Estratto da ContactPage.vue senza il wrapper decorativo (blob SVG, padding full-page).
- **`src/components/DesktopSidebar.vue`** — colonna sinistra del layout xl+:
  - Logo toBear + nome app in alto
  - Bottoni "About" e "Contatti" che emettono `@openPanel` ad AppLayout (nessun cambio di route, resta sempre `/todo`)
  - In fondo: auth (Accedi/Registrati se guest, nome + Esci se authenticated)
  - Stats compatte: "N task di cui M completati" (solo authenticted, fetch via `useTaskStats`)
- **`src/components/DesktopContentPanel.vue`** — colonna destra del layout xl+:
  - Mostra `AboutContent` o `ContactContent` in base al prop `section`
  - Bottone `×` che emette `@close` per chiudere il pannello
  - Padding e stili adattati al contesto colonnare stretto (`overflow-y-auto`, `p-6`)

### Modifiche ai componenti esistenti (6)
- **`src/views/AppLayout.vue`** — refactor principale:
  - Aggiunto `activePanel` (ref locale `'about' | 'contact' | null`)
  - Sotto xl (<1280px): comportamento invariato (header tradizionale + RouterView), stessi elementi
  - A xl+ (≥1280px): grid a 3 colonne — sidebar sinistra (14rem) | centro (1fr, flex) | pannello destro (24rem, solo se `activePanel` è impostato)
  - Grid dinamica: `xl:grid-cols-[14rem_1fr]` senza pannello, `xl:grid-cols-[14rem_1fr_24rem]` con pannello
  - Padding del `<main>` cambiato da `pb-20 md:pb-0` a `pb-20 xl:pb-0` per proteggere dal FAB anche nella fascia intermedia (vedi visual check sotto)
- **`src/components/MobileNavFab.vue`** — breakpoint esteso: `md:hidden` → `xl:hidden`. Ora visibile su mobile (<md) E desktop stretto (md–xl, 768–1280px). Stesso popover, stessa posizione (`bottom-6 left-6`).
- **`src/pages/AboutPage.vue`** — ridotto a wrapper `<div class="bg-white px-6 py-24 ...">` che importa e monta `<AboutContent />`.
- **`src/pages/ContactPage.vue`** — ridotto a wrapper (include il blob decorativo inalterato) che importa e monta `<ContactContent />`.
- **`src/pages/UserProfile.vue`** — rimpiazzato fetchTasks inline con `useTaskStats()`.

### Test E2E
- **`e2e/spa-navigation.spec.js`**:
  - Aggiunto `page.setViewportSize({ width: 1400, height: 900 })` per forzare layout xl+ con sidebar visibile
  - Sostituito `getByText().first()` con `getByRole(role, { name: /.../i }).first()` — selettori resilienti alla posizione del link (header vs sidebar)
  - Aggiunta gestione del banner CookieConsent (click "Rifiuta" se presente) perché a `z-50` bloccava il click sul link "Registrati" nella sidebar
  - Testato e passante in 2.8s (6/6 step senza skip)

### Visual check FAB a 1024px
- Playwright ha creato 15 task, viewport 1024×800: FAB visibile, `main` aveva `padding-bottom: 0px` (md+), causando overlap con l'input field.
- Fix: `pb-20 md:pb-0` → `pb-20 xl:pb-0` su `<main>` in AppLayout. Padding di 80px corrisponde esattamente all'area coperta dal FAB (56px icona + 24px `bottom-6`).
- Verifica post-fix: nessun overlap.

## Stato attuale

- **Tutto implementato e funzionante.** Layout 3 colonne attivo a xl+, header tradizionale sotto xl, FAB visibile sotto xl (sia mobile che tablet/desktop stretto).
- **Lint**: 0 nuovi errori (46 pre-esistenti invariati: markdown lint in AGENTS.md/TODO.md + PaginationElement unused var).
- **Unit test**: 34/34 passanti (useGuestMigration, userStore, useTaskDB).
- **E2E test**: 2/2 passanti (spa-navigation con viewport 1400px, todo-task-enter invariato).
- **TodoPage.vue non toccato**: il "cuore" (lista task, swipe, drag, editing, offline sync) è invariato. Il layout cambia solo il contenitore esterno.
- **GuestLayout/DefaultLayout non toccati**: About/Contact come pagine intere funzionano ancora (usate su mobile e per accesso diretto via URL).

## Decisioni prese

- **Breakpoint `xl:` (1280px) per il passaggio a 3 colonne**: su un monitor 1366px, la content area disponibile è ~1320px; `xl:` scatta con margine. Usare un breakpoint standard (non custom) evita complessità.
- **Sidebar sinistra con bottoni (`<button>`) invece di `<RouterLink>` per About/Contact su xl+**: il pannello destro è stato locale (non cambia URL), quindi non usiamo Vue Router per questa interazione. I bottoni emettono eventi ad AppLayout che imposta `activePanel`.
- **useTaskStats estratto da UserProfile.vue invece di mantenere logica inline**: la sidebar necessita dello stesso fetch (conteggio task completati). Invece di duplicare la logica, è stato creato un composable riusabile. UserProfile.vue ora lo usa.
- **AboutContent e ContactContent come micro-componenti separati (non opzioni/props su AboutPage/ContactPage)**: mantiene la separazione delle responsabilità. AboutPage.vue è un wrapper di layout (padding full-page), AboutContent.vue è solo contenuto. Il pannello destro può importare AboutContent senza ereditare stili full-page.
- **FAB intermedio mantiene `bottom-6 left-6` (stessa posizione del mobile)**: verificato con Playwright che padding `pb-20` protegge adeguatamente. La familiarità per l'utente (stessa posizione su mobile e desktop stretto) vale la pena.
- **CookieConsent in App.vue (non nei layout)**: decisione presa nell'handoff precedente. In questa sessione è emerso che il banner a `z-50` blocca i click sulla sidebar. Il test E2E è stato aggiornato per gestirlo (click "Rifiuta" pre-navigazione), ma è un promemoria che eventuali nuovi elementi fixed a z-index alto potrebbero interferire con la sidebar.

## Prossimi passi

1. **UX Desktop — hover-reveal buttons** per complete/delete (TODO.md riga 15-16, voce aperta dagli handoff 2026-06-28 e 2026-06-30). È la prossima feature più importante per la parità mobile/desktop.
2. **Scrivere test Vitest per TaskItem.vue** (swipe, tap, editing, long-press) — voce aperta da handoff 2026-06-21.
3. **ProfileIcon.vue** — distinguere guest da authenticated (TODO.md riga 22, handoff 2026-06-29).
4. **Sync offline batch**: endpoint `POST /v1/tasks/batch-import` (TODO.md riga 28, handoff precedenti).
5. **Considerare commit** delle modifiche correnti se lo stato lo permette.

Nessuna nuova voce in TODO.md da aggiungere — questa sessione (redesign desktop 3 colonne) non era elencata nella roadmap.

## Note per il backend

- **Nessuna nuova richiesta API in questa sessione.** Tutti i cambiamenti sono lato frontend.
- `useTaskStats` usa `GET /v1/tasks` (endpoint già esistente).
- Da handoff precedenti: serve ancora `POST /v1/tasks/batch-import` e `POST /v1/contact` (quest'ultimo già implementato lato backend, il frontend ContactContent.vue lo usa).

## File rilevanti

- `src/views/AppLayout.vue` — refactor principale: 3 colonne grid, gestione activePanel, header condizionale, padding FAB
- `src/components/DesktopSidebar.vue` — **nuovo**: sidebar sinistra
- `src/components/DesktopContentPanel.vue` — **nuovo**: pannello destro embed
- `src/components/AboutContent.vue` — **nuovo**: contenuto About riusabile
- `src/components/ContactContent.vue` — **nuovo**: form Contatto riusabile
- `src/composables/useTaskStats.js` — **nuovo**: composable conteggio task
- `src/components/MobileNavFab.vue` — breakpoint esteso
- `src/pages/AboutPage.vue` — wrapper, riusa AboutContent
- `src/pages/ContactPage.vue` — wrapper, riusa ContactContent
- `src/pages/UserProfile.vue` — usa useTaskStats
- `e2e/spa-navigation.spec.js` — selettori resilienti, viewport esplicito, gestione cookie banner
