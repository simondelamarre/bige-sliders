# Changements

Versions de `bige-sliders`, de la plus récente à la plus ancienne. En 0.x, un
changement cassant fait monter le chiffre du milieu.

## 0.8.0 · 2026-11-13

- Textes : contour (couleur et épaisseur) et ombre dans l’éditeur, le PDF et
  le PPTX éditable.
- `PresentationDressingEditor` depuis `bige-sliders/vue` : édition autonome
  d’un habillage avec `v-model`, document de référence, variables, groupes,
  plans et assets préservés.
- Champs de modèles `text`, `list` et `image` portés par les objets ;
  `templateFieldsOfSlide`, `fillPresentationTemplate` et
  `setPresentationTemplateField`. Les anciens slots `title`/`body` restent
  compatibles. Une image remplacée garde son cadre et son cadrage ; un champ
  facultatif vide peut être masqué à l’export.
- `diagnosePresentationRender` mesure après chargement des polices et signale
  retours à la ligne, texte coupé, collisions et polices substituées avec les
  ids d’objets. `allowOverlapWith` déclare une superposition intentionnelle.
- Rail de slides : affichage mémorisé par vignettes, titres ou les deux.
- Inspecteur texte : accordéons dans l’ordre couleur, contour, ombre ; l’option
  transparente est disponible pour la police, les peintures et les effets,
  avec conservation dans le PDF et le PPTX.
- Inspecteur texte simplifié dans l’ordre alignement, style/police/taille,
  gras/italique/souligné, couleur et arrière-plan, contour puis ombre. Le
  contour se désactive à 0 pt ; l’ombre propose Aucun/Petit/Moyen/Grand avant
  les réglages personnalisés. Les accordéons partagent le composant visuel des
  sections du thème.
- Démo npm : deck bige-ops et recette des trois API depuis le tarball.

## 0.7.1 · 2026-11-12

- Les raccourcis globaux de l’éditeur (Suppr, flèches, copier-coller, annuler,
  enregistrer…) n’agissent plus sur un deck quand un autre panneau de
  l’application hôte est actif.
- Nouveau plugin Obsidian desktop distribué hors catalogue officiel : fichiers
  `*.bige-slides` dans le vault, enregistrement automatique, images dans les
  pièces jointes et exports PDF/PPTX à côté du deck.
- Le build Obsidian embarque désormais la feuille Tailwind et le reset isolé de
  `bige-sliders`, et refuse une installation si les classes de structure sont
  absentes.

## 0.7.0 · 2026-11-09

- **`layouts.includeBuiltIn: false`** : le catalogue ne propose que tes layouts,
  sans les 17 livrés, dans la galerie comme à l’agent. Les slides existantes
  restent intactes ; sans aucun layout, la galerie propose une slide vierge.
- **Ta bibliothèque d’images dans la galerie** (`host.images`) : un onglet par
  source à côté de « Ce deck », recherche, filtres, défilement infini, un clic
  pose l’image, un glisser-déposer la pose à l’endroit voulu, une image
  sélectionnée est remplacée. Rien n’est ré-envoyé : la clé et l’origine
  suivent l’image dans les layouts enregistrés et à la copie entre decks. Sans
  `host.images`, rien ne change.
- `createHttpImageSource` pour une API au format documenté (ou `map` pour une
  autre forme) ; `host.images.save` ajoute « Enregistrer dans la bibliothèque ».
- **Centrer** horizontalement et verticalement une sélection, ou un objet seul
  sur la slide, à côté des alignements sur les bords.
- **Styles communs d’une sélection** : police, niveau, taille, alignement,
  gras, italique et souligné pour tous les textes ; bordure, épaisseur,
  arrondi, ajustement et ombre pour les formes, tracés et images. Seuls les
  réglages des objets choisis s’affichent, « Mixte » quand ils diffèrent.
- PPTX : une image `data:` en clair (SVG encodé) disparaissait du fichier ; elle
  y est.
- **Au-dessus de l’app hôte** : la lecture passe en plein écran du
  navigateur ; plein écran d’édition, fenêtres, popovers et menus sur une
  base unique `--deck-layer` (1000 par défaut, au-dessus d’une barre à 999) ;
  événement `fullscreen-change` et attribut `data-deck-fullscreen`.
- **Zone de travail** autour de la slide en édition : les poignées de l’objet
  sélectionné (taille, rotation, points de tracé) restent saisissables hors
  du cadre, le contenu qui dépasse reste coupé ; « Ajuster à la sélection »
  dans le menu de zoom.
  Quand l’app hôte a des barres de défilement qui prennent de la place
  (`::-webkit-scrollbar`), la slide ne se redimensionne plus en boucle à
  chaque image.
- **Rotations** : Maj pendant une rotation à la souris tourne par pas de 15° ;
  ⌥ + ← / → pivote de 15° (1° avec Maj). Touche `?` : aide des raccourcis.
- **Icônes Iconify plus robustes** : délai maximal, nouvel essai, serveurs
  publics de secours, messages clairs (limite atteinte ou réseau) ; aperçus
  d’une recherche en une requête par jeu d’icônes, 24 résultats au lieu
  de 48 ; icônes construites depuis les données JSON d’Iconify.
- `createIconifyIconProvider({ hosts, limit })` pour brancher ta propre API
  Iconify ; `ICONIFY_PUBLIC_HOSTS` ; `previews` facultatif sur
  `PresentationIconProvider`.

## 0.6.0 · 2026-11-06

- **`PresentationSlideThumbnail`** (`bige-sliders/vue`) : vignette 16:9
  légère d’un layout enregistré, d’une slide de deck ou d’un layout du
  catalogue.
- **`PresentationSlideEditor`** : éditeur d’une seule slide (outils et
  inspecteur, sans liste de slides, exports ni thème), `v-model` sur un layout
  enregistré. `PresentationWorkspace` accepte `variant="slide"`.
- `presentationLayoutSetup()` et `removeLayoutTemplate(id)` pour les pages de
  gestion de galerie.
- Zoom : au-delà de la vue, la slide se faisait couper à gauche et en haut
  sans défilement possible ; chaque bord reste atteignable et la vue garde son
  centre pendant le zoom.
- Démo : page « Mes layouts » (vignettes, édition d’un favori seul,
  suppression) ; README : section « Vignettes et édition d’une slide ».

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
