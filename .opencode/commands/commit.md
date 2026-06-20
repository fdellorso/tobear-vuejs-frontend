---
description: Prepara un commit pulito con messaggio convenzionale per il frontend
agent: build
---

Stato attuale del repository:

!`git status`

Diff completo:

!`git diff`

Diff dei file già in staging (se presenti):

!`git diff --cached`

Sulla base di queste modifiche:

1. Se ci sono modifiche non in staging che sembrano appartenere logicamente a questo commit, propon di farne `git add`, ma chiedi conferma prima di eseguirlo se ci sono file ambigui (es. `.env*`).
2. Esegui `npm run lint` e `npm run format` prima di committare.
3. Scrivi un messaggio di commit in inglese, formato Conventional Commits (`feat:`, `fix:`, `refactor:`, `chore:`, `style:`, `docs:`), con un subject conciso (max ~72 caratteri) e, se utile, un corpo che spiega il "perché".
4. Esegui il commit con `git commit`.
5. NON eseguire `git push` a meno che non venga chiesto esplicitamente.

Se le modifiche richiedono un cambiamento lato API/backend, menzionalo nel corpo del commit message.
