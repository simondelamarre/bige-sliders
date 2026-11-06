# Changements

Versions de `bige-sliders`, de la plus récente à la plus ancienne. En 0.x, un
changement cassant fait monter le chiffre du milieu.

## 0.5.0 · 2026-11-06

- **Favoris de slides** : menu ⋯ d’une slide → « Enregistrer comme layout »
  (nom, onglet existant ou nouveau, description). Le layout apparaît tout de
  suite dans la galerie et pour l’agent ; une slide issue d’un favori peut le
  mettre à jour. Événement `@bookmark` avec le réglage `layouts` complet à
  stocker et à renvoyer (`layouts.templates`, `layouts.tabs`).
- Layouts en JSON (`PresentationLayoutTemplate`) : la slide, ses images et ses
  zones titre et texte ; `layoutTemplateFromSlide`, `layoutFromTemplate`,
  `saveLayoutTemplate`, `savedPresentationLayouts`.
- **`@theme-save`** à chaque création, modification ou suppression d’un thème
  personnel, avec la liste complète ; les thèmes renvoyés par l’app et ceux
  du poste se fusionnent sans doublon.
- Icônes : un SVG sans taille en pixels (l’étoile par défaut, les icônes en
  `em`) était dessiné décalé et coupé dans Chrome ; il s’affiche entier.
- README : captures, tableau des fonctions, section « Favoris et thèmes
  personnels ». Démo : nouvel en-tête, favoris et thèmes gardés au
  rechargement.

## 0.4.0 · 2026-11-06

- **Habillages** à la place des repères (changement cassant) : des calques
  d’objets (textes, formes, images, icônes, groupes) édités sur le canevas
  comme une slide, devant ou derrière le contenu, avec les variables
  `{page}`, `{total}`, `{deck}`, `{slide}` et `{date}`. Plusieurs par deck,
  choisis slide par slide (ou aucun) ; portés par les thèmes.
- `definePresentationTheme` prend `dressings` ; `header`, `footer`,
  `pageNumber` et `style` disparaissent. `PresentationThemePreset.chrome`
  devient `dressings`.
- Document : `dressings`, `defaultDressing`, `slide.dressing`. Les decks et
  thèmes enregistrés avant gardent leur rendu (anciens repères convertis).
- Galerie de compositions : le grand aperçu suit le layout sélectionné.

## 0.3.0 · 2026-11-06

- Catalogue réglable au démarrage (`configurePresentationCatalog`) : layouts
  de l’app, onglets de la galerie et leur ordre, thèmes proposés et thème des
  nouveaux decks. Sans réglage, rien ne change.
- L’agent suit le même catalogue : `deckLayoutCatalog`, `applyDeckOperations`,
  `themeCatalog` et `editDeckTheme` ne proposent que ce que la galerie montre.
- `definePresentationTheme` : un thème complet à partir d’un id, d’un nom,
  d’un ton et de six couleurs ; `typeScale` exporté.
- Le deck de départ de l’hôte utilise le premier layout du premier onglet.
- README : section « Catalogue », tableaux des champs d’un layout et d’un
  thème. Démo : un layout et un thème maison, des onglets réorganisés.

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
