# Handoff — 2026-07-02 — Migrazione pagine auth al design system tb-*, refactor componenti login/register, spostamento route in AppLayout

## Cosa è stato fatto

### STEP 1-2: Nuovi componenti riusabili LoginContent e RegisterContent
- **`src/components/LoginContent.vue`** (nuovo) — form login pulito temizzato tb-*, con prop `errorMessage`, `verifiedMessage`, `inPanel`. Emette `submit-login` e `submit-forgot`. Include link "Forgot password?" con input per reset email e link "Sign up". Classi Tailwind `tb-*` (accent, surface, border, text, nav-active, success/danger bg).
- **`src/components/RegisterContent.vue`** (nuovo) — form registrazione temizzato tb-* con validazione lato client per name/email/password/confirm. Espone `setErrors()` via `defineExpose` per errori lato server. Emette `submit-register`. Link "Sign in".

### STEP 3: Refactor LoginPage e RegisterPage
- **`src/pages/LoginPage.vue`** — da 89 a 22 righe: rimosso `SignInPage` (tailwindplus) e usato `LoginContent`. Stessa logica auth (login, forgot, redirect, verifiedMessage). Rimosso `flatRoutes` e `navigationRoutes`. Rimosso import commentato.
- **`src/pages/RegisterPage.vue`** — da 138 a 22 righe: rimosso form inline hardcoded (classi `bg-white`, `text-gray-900`, `outline-indigo-600`, `bg-blue-800`) e usato `RegisterContent`. Template spostato prima dello script (coerente con le convenzioni del progetto).

### STEP 4: Pannello destro auth e sidebar
- **`src/views/AppLayout.vue`** — `handlePanelRedirect` esteso a mappa oggetto: ora intercetta `/login`, `/register`, `/user`, `/setting` oltre a `/about` e `/contact`. Aggiunto `@login-success="activePanel = null"` su `DesktopContentPanel`.
- **`src/components/DesktopContentPanel.vue`** — aggiunte sezioni `login`, `register`, `user`, `setting` con import di `LoginContent`, `RegisterContent`, `UserProfile`, `UserSettings`. Implementato `handlePanelLogin()` con `withCSRF → /login → clearSession → fetchUser → emit('login-success')`. Validator aggiornato. Nuovo emit `login-success`.
- **`src/components/DesktopSidebar.vue`** — aggiunto bottone "Profile" nella nav (solo `mode === 'authenticated'`, icona `UserIcon`, toggle pannello). Bottoni "Accedi" e "Registrati" cambiati da `RouterLink` a `button` con `@click="$emit('openPanel', ...)"`. Aggiunto blocco `v-else` fallback per `mode === null` con Accedi/Registrati.

### Fix minori
- **`src/components/MobileNavFab.vue`** — aggiunto `cursor-pointer` al `PopoverButton`.
- **`src/components/LoginContent.vue`** — rimosso `const props =` (assegnazione inutilizzata). Aggiunto commento nel `catch` vuoto di `LoginPage.vue` per evitare lint no-empty.
- Wrapper esterno di `LoginContent.vue` e `RegisterContent.vue`: `px-4 py-6` → `mx-auto max-w-md px-4 py-8 min-h-screen`.

### Route auth spostate in AppLayout
- **`src/router/index.js`** — route `/login` e `/register` rimosse dal gruppo `GuestLayout` (con `LoginPage`/`RegisterPage`) e aggiunte al gruppo `AppLayout`. Effetto: su mobile login/register hanno `MobileNavFab` sempre visibile; su desktop xl+ `handlePanelRedirect` le intercetta e le apre nel pannello destro. `GuestLayout` ora ha solo `/verifyemail` e `/premium`.

### Cose notate ma non toccate
- `git diff --stat` mostra anche modifiche non riconducibili a questa sessione in: `index.html`, `src/composables/useTaskStats.js`, `src/pages/UserProfile.vue`, `TODO.md`. Sono preesistenti e non sono state intenzionalmente modificate qui.

## Stato attuale
- **Login/Register funzionanti** sia su mobile (full page, dentro AppLayout con FAB) che su desktop xl+ (pannello destro). Login da pannello desktop fa `emit('login-success')` che chiude il pannello e aggiorna lo user store, senza navigare via da `/todo`.
- **Tutti i form auth migrati** a classi `tb-*` (accent, surface, border, text, danger/success). Le pagine auth non usano più classi hardcoded `bg-white`, `text-gray-900`, `bg-indigo-600`, ecc.
- **`GuestLayout`** ora contiene solo VerifyEmail e Premium — potenzialmente eliminabile se VerifyEmail viene anch'esso spostato fuori.
- **Lint**: 52 errori pre-esistenti (markdown in AGENTS.md/TODO.md, unused var in PaginationElement.vue) — zero nuovi.
- **Test**: 34/34 passati (Vitest).

## Decisioni prese
- **Login/Register sotto AppLayout invece che GuestLayout**: su mobile il FAB di navigazione resta accessibile anche sulle pagine auth. Su desktop le route vengono intercettate e mostrate nel pannello destro. Questo rende l'esperienza più coerente: l'utente non viene "strappato" via dal layout principale per fare login.
- **`inPanel` prop su LoginContent**: differenzia il comportamento login su pagina piena vs pannello. In pagina piena (`LoginPage.vue`) il login fa `router.push({ name: 'Todo' })`. Nel pannello (`DesktopContentPanel`) emette `login-success` e AppLayout chiude il pannello — nessuna navigazione necessaria perché siamo già su `/todo`.
- **Bottoni Accedi/Registrati in sidebar come button con emit**: su xl+ aprono pannello invece di navigare a una nuova route, coerente con About/Contatti.
- **Titolo pannello dinamico**: lookup object `{ about: 'About', contact: 'Contatti', login: 'Sign in', ... }` invece di ternario fisso, estensibile per future sezioni.

## Prossimi passi
1. **Migrare VerifyEmail.vue** fuori da GuestLayout (se GuestLayout diventa inutilizzato, può essere rimosso).
2. **TODO.md #16** (UX desktop hover-reveal buttons) — ancora la priorità più alta non completata.
3. **TODO.md #18** (HomePage.vue) — decidere recupero o rimozione.
4. **TODO.md #22** (`ProfileIcon.vue`) — voce superata, il file non esiste più. Segnare come completato o rimuovere.
5. **UserSettings.vue** ha ancora classi hardcoded (`text-gray-700`, `bg-blue-800`, `border-gray-300`) — non ancora migrato al design system tb-*.
6. **Scrivere test Vitest per TaskItem.vue** (swipe, tap, editing, long-press) — voce aperta da handoff precedenti.

## Note per il backend
- Nessuna nuova richiesta API in questa sessione.
- Endpoint `POST /v1/tasks/batch-import` per sync offline batch è ancora pendente (TODO.md #31).

## File rilevanti
- `src/components/LoginContent.vue` — nuovo componente form login
- `src/components/RegisterContent.vue` — nuovo componente form registrazione
- `src/pages/LoginPage.vue` — refactored, 22 righe
- `src/pages/RegisterPage.vue` — refactored, 22 righe
- `src/views/AppLayout.vue` — handlePanelRedirect a mappa, event login-success
- `src/components/DesktopContentPanel.vue` — sezioni login/register/user/setting
- `src/components/DesktopSidebar.vue` — Profile button, Accedi/Registrati via emit
- `src/components/MobileNavFab.vue` — cursor-pointer su PopoverButton
- `src/router/index.js` — Login/Register spostati in AppLayout
