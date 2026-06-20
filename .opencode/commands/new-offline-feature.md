---
description: Crea una nuova feature offline-capable (pagina/componente + store IndexedDB + sync) seguendo il pattern dei task
agent: build
---

Voglio creare una nuova feature offline-capable: $ARGUMENTS

Usa la skill `offline-sync-pattern` come riferimento esatto, e `vue-conventions` per la struttura di file/componenti.

Prima di scrivere codice:
1. Chiedimi (se non è già chiaro dal contesto): nome dell'entità, campi principali, se richiede drag&drop/ordinamento, se è una feature "premium" (vedi TODO.md) o disponibile a tutti.
2. Mostrami un piano sintetico (wrapper IndexedDB, store/composable, pagina, route, chiamate axios) PRIMA di scrivere file, a meno che non ti abbia detto esplicitamente di procedere senza piano.

Poi implementa nell'ordine: wrapper `src/idb/use{Entita}DB.js` → pagina in `src/pages/` → route in `src/router/index.js` → integrazione axios con fallback offline e sync su `online`.

Alla fine, dimmi esplicitamente se questa feature richiede un nuovo endpoint o un cambio di formato risposta lato backend, così posso passarlo alla sessione OpenCode del backend.
