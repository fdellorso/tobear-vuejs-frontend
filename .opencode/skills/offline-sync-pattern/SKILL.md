---
name: offline-sync-pattern
description: Il pattern offline-first con IndexedDB e sincronizzazione online/offline usato per i task in toBear. Usa questa skill quando devi rendere una nuova feature offline-capable, lavori su useTaskDB, o estendi la sincronizzazione di dati locali col backend.
license: MIT
metadata:
  project: tobear-vuejs-frontend
---

# Offline sync pattern — toBear frontend

Questo è il pattern di riferimento implementato in `src/pages/TodoPage.vue` + `src/idb/useTaskDB.js`. Per qualunque nuova entità che deve funzionare offline (vedi roadmap PWA in `TODO.md`: liste della spesa, liste condivise, ecc.), replica esattamente questa struttura.

## 1. Wrapper IndexedDB dedicato

Per ogni nuova entità offline-capable, crea un file `src/idb/use{Entita}DB.js` sul modello di `useTaskDB.js`:

```js
import { openDB } from 'idb'

const DB_NAME = 'tobear-db'   // stesso DB, store diversi per entità diverse
const DB_VERSION = 2           // incrementa la versione se aggiungi un nuovo object store
const STORE_NAME = '{entita}'

let dbPromise = null

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' })
        }
      },
    })
  }
  return dbPromise
}

export function use{Entita}DB() {
  // getAll, save, saveMany, clear — stesse firme di useTaskDB
}
```

Importante: se aggiungi un nuovo object store, DEVI incrementare `DB_VERSION`, altrimenti `upgrade()` non viene richiamato sui browser che hanno già il DB alla versione precedente.

## 2. Fetch con fallback offline

```js
const fetchEntities = async () => {
  loading.value = true
  try {
    const response = await axiosClient.get('/v1/{entita}')
    if (Array.isArray(response.data.data)) {
      entities.value = response.data.data
      await clearEntities()
      await saveEntities(response.data.data)
      entities.value = await getAllEntities()
    }
  } catch (error) {
    console.warn('Errore fetching da rete, carico da IndexedDB', error.message)
    entities.value = await getAllEntities()
  } finally {
    loading.value = false
  }
}
```

## 3. Creazione offline con flag `localOnly`

```js
catch (error) {
  const localEntity = {
    id: `local-${Date.now()}`,
    // ...campi...
    localOnly: true,
  }
  await saveEntity(localEntity)
  entities.value.push(localEntity)
}
```

## 4. Sync al ritorno online

Nel componente che gestisce la lista, registra il listener UNA volta in `onMounted`:

```js
onMounted(() => {
  fetchEntities()
  window.addEventListener('online', () => {
    syncLocalEntities()
  })
})
```

`syncLocalEntities` itera i record con `localOnly: true`, li invia al backend, e se va a buon fine pulisce e rifà il fetch.

## Attenzione

- Non condividere lo stesso `STORE_NAME` tra entità diverse.
- Il service worker (vite-plugin-pwa, configurato in `vite.config.js`) ha già un caching `NetworkFirst` per `/api/*` — questo è un livello diverso e complementare rispetto a IndexedDB: il service worker cachea le risposte HTTP, IndexedDB è lo store applicativo usato per editing offline e id locali. Non confondere i due livelli né cercare di farne fare uno solo all'altro.
