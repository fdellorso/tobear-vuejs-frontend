# TODO List

## Core / MVP

- [x] verify with email
- [x] TaskItem frontend component (swipe left and right)
  - [x] completed api operation
  - [x] delete api operation
- [x] Riabilitare PWA + HTTPS (mkcert) in vite.config.js — ora gestito da Caddy + step-ca, mkcert non più usato
- [x] Long-press per attivare drag su mobile (risolve conflitto swipe/drag verticale)
- [x] Swipe a soglia percentuale (commit-on-release, non a metà gesto)
- [x] Animazione completamento task → sezione "Completati" separata, con feedback haptic
- [x] Modalità locale-only (guest) senza account — todo list usabile offline al 100%
- [x] Migrazione task guest → account al login (creati / completati / cancellati)
- [x] Homepage rimossa dal flusso principale — `/` ora redirige direttamente a `/todo`
- [x] **UX Desktop — azioni complete/delete via hover-reveal** (swipe mouse rimosso per conflitto strutturale con SortableJS, vedi handoff 2026-06-28)
- [x] Verificare/rifinire UX desktop generale (drag&drop ora funziona col mouse, ma manca ancora un modo di completare/eliminare senza touch)
- [x] PWA service worker cache per offline — navigateFallback corretto (era `/offline.html`, ora `/index.html`), NavigationRoute serve app shell per tutte le route SPA. Sync online (IndexedDB + event `online`) già funzionante.
- [x] HomePage.vue — decidere se recuperarla come landing pubblica/marketing in futuro o lasciarla in pausa (codice esistente ma non referenziato da nessuna route)

## Bug noti / debito tecnico

- [x] I 9 test pre-esistenti del frontend (markdown lint, PaginationElement variabile inutilizzata) — non bloccanti, da pulire quando si ha tempo
- [x] `ProfileIcon.vue` — non distingue "guest" da "non ancora deciso" nel testo del link — rimosso, era codice morto
- [x] Primo test E2E Playwright stabile: `e2e/spa-navigation.spec.js` — verifica che ogni navigazione interna sia client-side (Vue Router) senza full-page reload. Config in `playwright.config.js`, script `npm run test:e2e`. Usare `baseURL: 'https://laravel.fritz.box:3000'` in sviluppo (cert/CORS), mai `localhost`.
- [ ] File temporanei di test `resize()` in `public/assets/` (backend) non vengono puliti tra run — monitorare crescita, eventualmente migrare a `Storage::fake()`

## Decisioni architetturali in sospeso

- [ ] Backend: valutare se/quando migrare da ownership check manuale (trait `OwnsModel`) a Laravel Policies — per ora deciso di NON migrare (vedi handoff), da rivalutare solo se arrivano ruoli/permessi complessi
- [ ] Endpoint backend `POST /v1/tasks/batch-import` — non esiste, oggi la migrazione guest→sync usa N POST singole (sufficiente alla scala attuale, da rivedere se serve performance/atomicità)
- [ ] Modify Backend Authentication to serve Mobile App for offline authentication

## Pubblicazione MVP

- [ ] Dominio pubblico reale + certificato Let's Encrypt (oggi solo `laravel.fritz.box` locale via step-ca, non accessibile da internet)
- [x] Verifica icona/manifest PWA — manifest pulito (rimossi scaffolding, `prefer_related_applications`, placeholder Play Store), `apple-touch-icon` corretto, `start_url`/`scope` relativi
- [ ] Promozione su r/PWA (Reddit) per validare interesse prima di investire in tier paganti

## toBear Sync [tier pagante]

- [ ] Modello tier/subscription status sull'utente (free / sync / reel)
- [ ] Integrazione Stripe (checkout, webhook stato abbonamento, rinnovi)
- [ ] Infrastruttura: Hetzner Cloud (VPS Laravel + DB) — solo per utenti Sync/Reel, free resta locale-only

## toBear Reel [tier pagante premium]

- [ ] Definire modello dati: foto-task come entità nuova o estensione di Image/Task esistenti
- [ ] UI: card fullscreen verticali, swipe su/giù cambia foto, swipe laterale completa/elimina, overlay note al tap
- [ ] Decidere se le foto completate/non eliminate diventano "memorie" archiviate (collezione separata?)
- [ ] Storage/CDN: Cloudflare R2
- [ ] Naming interno sezioni (es. "collezione ricordi" vs "lista attiva")
- [ ] Distinzione visiva foto-task attiva vs ricordo archiviato

## Idee / premium futuro

- [ ] end-to-end encryption of data [premium]
- [ ] shared list [premium]
- [ ] grocery list [premium]
- [ ] sync with HAss, caldav and more [premium]

## Visione e roadmap

### Filosofia del prodotto

- Offline-first, sync cloud opzionale
- PWA + desktop + mobile
- Ispirazione: Clear (UX, semplicità, gesti)
- NON competere su numero di funzionalità con Todoist/TickTick/Microsoft To Do
- Principio guida: meno opzioni, meno tocchi, più velocità
- **Mantra "zero attriti"**: ogni nuova feature deve ridurre i tocchi, non aggiungerli. Prima di accettare un dialogo di conferma, una scelta, un passaggio in più — cercare sempre l'alternativa fluida. Esempi concreti: completare una lista con figli → cascata silenziosa (non dialogo); eliminare una lista con figli → dialogo di conferma (è distruttiva e irreversibile, l'attrito è giustificato).
- Per ogni nuova funzione chiedersi: "rende l'app più semplice, o solo più ricca di opzioni?"

### Infrastruttura target (produzione)

- Hosting: Namecheap Shared Hosting (aggiornato da x10hosting/Hostinger)
- Storage immagini: Cloudflare R2
- CDN: Cloudflare
- Pagamenti: Stripe
- Dominio: ~12$/anno
- Costi stimati infrastruttura: ~5.88$/mese Namecheap + R2 (pochi €/mese anche con ~100GB immagini)

### Moduli pianificati

- 🧸 ToBear — core, free, solo locale
- 📷 ToBear Reels — foto come task, premium
- 🛒 ToBear Grocery — vista specializzata delle task (NON app separata), con quantità e foto opzionale
- 📊 ToBear Insights — dashboard motivazionale (streak, produttività settimanale, storico mensile, record personali)

### Business plan

Piani:

- Free: solo locale, nessun account obbligatorio
- Premium Classic: 2.99€/mese — sync + backup
- Premium Reels: 4.99€/mese — sync + backup + foto

Target: ~2.000 utenti paganti (1.500 Classic + 500 Reels)
Ricavi lordi stimati: ~6.980€/mese
Break-even infrastruttura: pochi abbonati (costi fissi bassissimi)

### Funzionalità future (ordine di priorità da definire)

#### Versione iniziale (MVP già in corso)

- [x] Task CRUD + reorder
- [x] Offline-first (IndexedDB)
- [x] Modalità guest senza account
- [ ] Liste multiple (oggi c'è solo una lista implicita)
- [ ] Sync multi-dispositivo (toBear Classic)
- [ ] Backup cloud

#### Architettura dati — decisione pendente importante

- Liste annidate (es. Casa > Spesa, Casa > Lavori): emerso come punto architetturale chiave
  - Permette condivisione e collaborazione naturale
  - IMPATTA lo schema dati attuale (oggi tasks piatte, nessuna lista)
  - Da progettare prima di implementare sync, altrimenti regressione garantita
  - Struttura esempio: Casa > Spesa > task, Casa > Lavori > task

#### Premium Reels (foto come task)

- Una sola foto per task, opzionale
- Ridimensionamento automatico + conversione WebP
- Visualizzazione full-screen
- Storage Cloudflare R2
- Le pagine Image/Album/Resize già esistono nel backend — punto di partenza tecnico

#### ToBear Grocery

- Vista specializzata delle task (NON app separata)
- Task grocery aggiunge: quantità, foto opzionale, nota
- Quantità NON esiste nelle task normali — estensione del modello task

#### ToBear Insights

- Dashboard motivazionale (non analytics aziendale)
- Metriche: task completate, streak giorni consecutivi, produttività settimanale, storico mensile, grafici, record personali

#### Versioni successive

- Condivisione liste
- Collaborazione
- Notifiche

### Note architetturali da valutare prima del sync

- Le liste annidate cambiano lo schema dati in modo non retrocompatibile
- Valutare se implementare liste flat prima (semplice), poi annidate (complesso)
- La modalità guest deve continuare a funzionare con qualsiasi struttura dati adottata

## Internazionalizzazione (i18n)

Prima della pubblicazione pubblica, valutare l'introduzione di un sistema multilingue.

Stato attuale: stringhe miste italiano/inglese nel frontend (UI in inglese, messaggi backend in italiano).

Decisione da prendere:

- vue-i18n (libreria ufficiale Vue, matura, supporta JSON per le traduzioni)
- Alternativa: file .ts con oggetti tipizzati (più leggero, meno funzionalità)

Raccomandazione: vue-i18n con file JSON per lingua (en.json, it.json) — standard de facto nell'ecosistema Vue, supporta pluralizzazione, date, numeri, lazy loading per lingua.

Priorità: dopo la pubblicazione MVP.
