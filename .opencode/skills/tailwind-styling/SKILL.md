---
name: tailwind-styling
description: Come usare Tailwind CSS v4 e i componenti tailwindplus esistenti in toBear. Usa questa skill quando lavori sullo stile di un componente, crei nuova UI, o devi decidere se riusare un componente tailwindplus esistente.
license: MIT
metadata:
  project: tobear-vuejs-frontend
---

# Tailwind styling — toBear frontend

## Setup

Tailwind v4 via plugin Vite (`@tailwindcss/vite`), non PostCSS config separata. Gli stili globali sono in `src/assets/style.css`. Non creare un secondo entrypoint CSS.

## Prima di scrivere un componente UI da zero

Controlla `src/components/tailwindplus/` — è una libreria di componenti scaffolded da Tailwind Plus che copre già: avatar, badge, banner, bento grid, blog section, contact section, content section, CTA, description list, drawer, dropdown, feature section, fly menu, form layout, header, hero section, input, logo section, modale, navbar, newsletter, not-found, page heading, paginazione, pricing, select, sign-in, stacked layout/list, stats, team, testimonial.

Se il pattern UI che ti serve esiste già lì (es. un modale, un form layout, un dropdown), adatta quel componente invece di scriverne uno nuovo da zero. Solo se la libreria non copre il caso, crea un componente custom in `src/components/`.

## Stile generale dell'app

L'app è in stile Clear (https://www.useclear.com/): minimale, gestuale (swipe), liste pulite. Quando proponi scelte di stile per nuovi componenti (es. TaskItem con swipe, vedi TODO.md), orientati verso:
- molto whitespace, pochi bordi/ombre pesanti
- interazioni gestuali (swipe left/right) più che bottoni espliciti dove sensato
- palette minimale (il progetto attualmente usa tonalità gialle/marroni in alcuni componenti placeholder: `bg-yellow-600`, `#8b5e3c` — verifica con l'utente se è la direzione finale o solo placeholder di sviluppo prima di propagarla ovunque)

## Classi utility vs componenti

Preferisci utility class inline coerenti con Tailwind v4, evita di estrarre `@apply` in CSS custom a meno che un pattern si ripeta in 3+ punti diversi del codice.

## Relazione con la skill `frontend-design`

Questa skill copre la struttura e il riuso dei componenti esistenti (cosa già c'è, come adattarlo). Per decisioni estetiche più fini su componenti nuovi o centrali nell'identità del prodotto (palette, tipografia, spaziatura, evitare pattern visivi generici), usa la skill `frontend-design` (Anthropic) come riferimento successivo, non in sostituzione di questa.
