# Capacités et parcours agent

## Choisir l’API

| Besoin | Lire | Modifier | Contrôler |
|---|---|---|---|
| Deck complet | `summarizeDeck`, `deckLayoutCatalog` | `applyDeckOperationsAtomic` | refus atomique + diagnostic ciblé |
| Une slide libre | `describeSlide` | `editSlideElementsAtomic`, `composeOnSlide` | `checkSlideLayout`, puis `diagnosePresentationRender` |
| Modèle nommé | `templateFieldsOfSlide` | `fillPresentationTemplate`, `setPresentationTemplateField` | champs requis + diagnostic |
| Thème | `themeCatalog` | `editDeckTheme` | `checkThemeContrast` |
| Habillage | `documentDressings`, `dressingOfSlide` | `PresentationDressingEditor` | variables, plans, ids et assets |
| Aperçu hôte | document ou template | aucun | `PresentationSlideThumbnail`, `renderSlideSnapshot` |

Préférer les variantes atomiques pour un lot produit par un LLM. Un refus
rend le document d’origine et désigne `failedOperation.index`, l’opération et
son motif. Limites par défaut : 20 opérations deck atomiques et 24 opérations
sur une slide ; découper un gros changement en petits lots cohérents.

## Parcours court et fiable

1. Résumer le deck et lire le catalogue au lieu d’inventer un layout.
2. Choisir un layout d’après `use`, puis remplir ses champs stables.
3. Utiliser les jetons `background`, `surface`, `text`, `muted`, `accent` et
   `accentSoft`; n’utiliser un HEX fixe que si la demande l’impose.
4. Appliquer un lot atomique. Renvoyer tout refus à l’agent, sans déplacer
   silencieusement les objets.
5. Exécuter le contrôle rapide de la slide, puis le diagnostic réel seulement
   sur les slides modifiées après `document.fonts.ready`.
6. Corriger `text-clipped`, `collision` et `font-fallback`; déclarer une
   superposition voulue avec `allowOverlapWith`.
7. Vérifier un aperçu, puis PDF et PPTX si un style ou un asset a changé.

## Ce que l’agent peut produire

- Texte riche, formes, tracés, flèches, images, icônes, tableaux et graphiques.
- Groupes, ordre de calques, alignement, distribution, masques et opacités.
- Slides depuis layouts code ou favoris, réordonnées, renommées, dupliquées,
  masquées ou supprimées.
- Thèmes, couleurs sémantiques, échelle typographique et habillages dynamiques.
- Champs `text`, `list`, `image` remplis sans recalculer la géométrie.

Un bloc texte accepte `color: "none"` pour des glyphes transparents,
`backgroundColor` pour le surlignage, `outline: { color, width }` et
`shadow: { color, opacity, blur, offsetX, offsetY }`. Ces valeurs existent
aussi sur les plages via `textRuns`. Le contour texte reste continu : le
pilote PPTX ne conserve pas fidèlement des pointillés sur les glyphes.

Les quatre boutons d’ombre de l’interface écrivent ces valeurs :

| Preset | Valeur |
|---|---|
| Aucun | `shadow: undefined` |
| Petit | `{ color: "text", opacity: 0.16, blur: 6, offsetX: 0, offsetY: 3 }` |
| Moyen | `{ color: "text", opacity: 0.24, blur: 16, offsetX: 0, offsetY: 8 }` |
| Grand | `{ color: "text", opacity: 0.30, blur: 32, offsetX: 0, offsetY: 16 }` |

## Invariants à ne jamais casser

- Le repère logique reste 1600 × 900 et les ids restent stables.
- Remplacer une image de champ change `assetId`, jamais sa boîte, son `fit`,
  son rayon, son masque, son groupe ou son plan.
- Un asset privé reste résolu et stocké par l’hôte ; ne pas intégrer de secret
  ni d’URL temporaire dans le document.
- Un champ facultatif vide reste visible dans l’éditeur et n’est masqué à
  l’export que si `hideWhenEmpty` vaut `true`.
- L’import PPTX éditable, les animations, le temps réel et les formats autres
  que 16:9 sont hors périmètre.

## Validation minimale

- `npm run build:sliders` dans `desktop/`.
- `npm pack`, puis installation du tarball avec `--no-save` dans `demo/`.
- `npm run typecheck` et `npm run build` dans la démo.
- Recette des trois scénarios : habillage dynamique, modèle texte/liste/image,
  collision titre/sous-titre avec ids exacts.
- Pour un changement de texte : tester transparent, arrière-plan, contour et
  ombre dans le canevas, le PDF et le PPTX.
