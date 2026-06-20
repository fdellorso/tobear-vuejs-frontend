---
name: vue-conventions
description: Convenzioni strutturali del frontend toBear (Vue 3 + Vite) — dove va ogni tipo di file, script setup vs Options API, naming di pagine/componenti/store. Usa questa skill quando crei nuovi componenti, pagine, store o quando non sei sicuro dove posizionare un file nel progetto.
license: MIT
metadata:
  project: tobear-vuejs-frontend
---

# Vue conventions — toBear frontend

## Dove vanno le cose

- `src/pages/` — un file per route "foglia" (es. `TodoPage.vue`, `LoginPage.vue`). Nome in PascalCase con suffisso `Page`.
- `src/views/` — layout che wrappano le pagine (`DefaultLayout.vue` per area autenticata, `GuestLayout.vue` per area pubblica). Non creare nuovi layout a meno che non serva davvero una struttura di pagina diversa.
- `src/components/` — componenti riusabili generici. Sottocartelle per domini specifici (es. `image/`).
- `src/components/tailwindplus/` — componenti scaffolded da Tailwind Plus. Trattali come libreria UI di base: adattali, non duplicarli.
- `src/stores/` — Pinia, un file per store, naming `use{Nome}Store`.
- `src/router/index.js` — tutte le route in un unico file, con `meta: { requiresAuth, guest, showInNav }`.

## Componenti: sempre script setup

```vue
<script setup>
import { ref, computed, onMounted } from 'vue'
// ...
</script>
```

Mai Options API (`export default { data() {...} }`) nei componenti — solo negli store Pinia, dove il progetto usa deliberatamente lo stile Options:

```js
const useXStore = defineStore('x', {
  state: () => ({ ... }),
  getters: { ... },
  actions: { ... },
})
```

Non "correggere" questa apparente incoerenza: è la convenzione del progetto.

## Route

Ogni route nuova va aggiunta in `src/router/index.js` dentro il layout corretto (`DefaultLayout` per autenticate, `GuestLayout` per pubbliche), con `meta.requiresAuth` impostato coerentemente. Verifica come viene gestito il redirect per route non autorizzate prima di aggiungere logica di guardia duplicata.

## Naming import

Il progetto usa l'alias `@` per `src/` (configurato in `vite.config.js` e `jsconfig.json`). Usa sempre `@/...` negli import, non path relativi lunghi (`../../../`).

## Chiamate API

Usa sempre `axiosClient` da `@/axios` per le chiamate autenticate. Non istanziare nuovi client axios in componenti — se serve una configurazione diversa, estendi `src/axios/index.js`.
