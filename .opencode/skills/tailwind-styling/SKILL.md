---
name: tailwind-styling
description: Come usare Tailwind CSS v4 e il design system tb-* token in toBear. Usa questa skill quando lavori sullo stile di un componente, crei nuova UI, o devi decidere tra utility class e componenti riusabili.
license: MIT
metadata:
  project: tobear-vuejs-frontend
---

# Tailwind styling — toBear frontend

## Setup

Tailwind v4 via plugin Vite (`@tailwindcss/vite`), non PostCSS config separata. Gli stili globali sono in `src/assets/style.css`. Non creare un secondo entrypoint CSS.

## Stile generale dell'app

L'app è in stile Clear (https://www.useclear.com/): minimale, gestuale (swipe), liste pulite. Quando proponi scelte di stile per nuovi componenti (es. TaskItem con swipe, vedi TODO.md), orientati verso:
- molto whitespace, pochi bordi/ombre pesanti
- interazioni gestuali (swipe left/right) più che bottoni espliciti dove sensato
- palette coerente con il design system `tb-*` token in `src/assets/themes.css` (es. `tb-accent`, `tb-text`, `tb-bg`, `tb-surface`). Non usare colori hardcoded generici.

## Classi utility vs componenti

Preferisci utility class inline coerenti con Tailwind v4, evita di estrarre `@apply` in CSS custom a meno che un pattern si ripeta in 3+ punti diversi del codice.

## Relazione con la skill `frontend-design`

Questa skill copre l'uso dei token TB esistenti e le utility Tailwind per la struttura dei componenti. Per decisioni estetiche più fini su componenti nuovi o centrali nell'identità del prodotto (palette, tipografia, spaziatura, evitare pattern visivi generici), usa la skill `frontend-design` (Anthropic) come riferimento successivo, non in sostituzione di questa.
