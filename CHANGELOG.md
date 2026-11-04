# Changements

Versions de `bige-sliders`, de la plus récente à la plus ancienne. En 0.x, un
changement cassant fait monter le chiffre du milieu.

## 0.2.0 · 2026-11-04

- Calques : les groupes s’affichent en blocs, avec leur menu (sélectionner le
  groupe, replier, masquer, dupliquer, dégrouper ou retirer le masque,
  supprimer) ; un groupe se glisse d’un seul tenant, ses membres se
  réordonnent entre eux.
- Formes et tracés : opacité du fond et de la bordure (0 à 100 %), respectée
  à l’écran, en PDF et en PPTX ; commandes `fill_opacity` et `stroke_opacity`.
- Compatible agents : README avec l’API de commandes JSON pour les LLM.
- Documentation complète : props, événements et `save()` du composant,
  options de l’hôte avec exemples (API, exports, S3, préférences), document,
  apparence de l’interface (variables CSS), Nuxt, raccourcis clavier.
- Démo publique (GitHub Pages, StackBlitz) et son code dans le dépôt
  `simondelamarre/bige-sliders`, dossier `demo/`.
- Le package est livré compilé (minifié, sans sourcemap), avec ses types.

## 0.1.1 · 2026-11-03

- Le package livre ce journal des changements (`CHANGELOG.md`).
- Aucune autre modification de l’éditeur.

## 0.1.0 · 2026-11-03

Première publication.

- Éditeur de slides 16:9 pour Vue 3 (`bige-sliders/vue`), modèle et commandes
  sans Vue (`bige-sliders`), styles limités à l’éditeur (`bige-sliders/style.css`).
- Exports PDF (police Inter embarquée) et PPTX modifiable, construits dans le
  navigateur.
- Texte, formes (fond et bordure « aucune » compris), plume, dégradés,
  masques, images, icônes, graphiques, tableaux, calques, groupes.
- Raccourcis : Alt + glisser pour dupliquer, Maj pour garder l’axe, ⌘A, ⌘X,
  ⌘] / ⌘[, P et V pour la plume.
- Hôte : enregistrement, stockage, images par URL (S3…), polices système.
