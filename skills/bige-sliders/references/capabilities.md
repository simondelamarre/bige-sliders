# Capacités et limites de bige-sliders

Cette matrice sert à savoir ce qu’un agent peut demander ou produire sans
inventer une capacité. Les noms cités sont les exports publics de la 0.8.1.

## Points d’entrée

| Import | Usage |
|---|---|
| `bige-sliders` | modèle JSON, fabriques, catalogue, commandes d’agent, champs de modèle, thèmes, habillages, host, autosave, diagnostic |
| `bige-sliders/vue` | éditeur complet, éditeur d’habillage, éditeur de layout, vignette et snapshot |
| `bige-sliders/style.css` | styles de l’éditeur, scopés sous `.deck-ui` |

Vue 3 est requis pour l’interface. Le cœur TypeScript reste utilisable sans
Vue, y compris dans un service Node qui prépare un document.

## Document et slides

| Besoin | API ou propriété | Notes |
|---|---|---|
| Nouveau deck | `createPresentationDocument(title)` | crée un document 16:9 valide |
| Nouvelle slide de catalogue | `createSlideFromLayout(layout, index, content)` | refuser un id absent du catalogue |
| Résumer pour un LLM | `summarizeDeck(document)` | renvoie positions, layouts, slots, données et slides masquées |
| Décrire précisément une slide | `describeSlide(document, slideId)` | boîtes, styles, régions libres, images et couleurs du thème |
| Créer/mettre à jour/déplacer/masquer | `applyDeckOperationsAtomic` | 20 opérations au plus par défaut, tout ou rien |
| Ajouter/modifier/grouper/aligner | `editSlideElementsAtomic` | 24 opérations au plus, tout ou rien |
| Composition rapide | `composeOnSlide(..., "steps" | "cards" | "flow", ...)` | remplit une région cohérente |
| Contrôle géométrique rapide | `checkSlideLayout` | hors slide, overflow, overlap, petit texte, table, contraste |

Les positions de slides des commandes deck commencent à 1. Le canevas logique
est toujours `1600 × 900`.

## Objets visuels

- Textes et plages riches (`textRuns`) : gras, italique, souligné, couleur,
  arrière-plan, alignement, interligne, styles typographiques et police.
- Effets de texte : `color: "none"`, `backgroundColor`, contour continu
  `{ color, width }`, ombre `{ color, opacity, blur, offsetX, offsetY }`.
- Formes : rectangle, arrondi, carte, pilule, ellipse, triangle, diamant,
  pentagone, hexagone, étoile, chevron, ligne et flèche.
- Fonds unis ou dégradés linéaires/radiaux, bordures, opacités, rayon et ombre.
- Tracés Bézier éditables avec points, poignées et fermeture.
- Images : `contain`/`cover`, rayon et ombre ; icônes SVG recolorables.
- Graphiques : bar, line, area, pie, donut, radar, scatter, waterfall et séries
  mixtes compatibles ; catégories, légendes, valeurs, axes et palette.
- Tableaux : cellules stylées, lignes d’en-tête, poids de colonnes, alignement,
  remplissages, bordures et marge interne.
- Groupes, verrouillage, visibilité, rotation, opacité, ordre et plans
  `back`/`front` pour les habillages.

## Thèmes et catalogue

| Besoin | API |
|---|---|
| Lister les thèmes proposés | `themeCatalog()` |
| Modifier preset/couleurs/polices | `editDeckTheme()` |
| Vérifier les contrastes | `checkThemeContrast()` |
| Enregistrer un thème applicatif | `registerPresentationTheme()` |
| Configurer layouts, onglets et thèmes | `configurePresentationCatalog()` |
| Lire le catalogue réellement offert | `offeredPresentationLayouts()`, `offeredPresentationThemes()` |
| Sauver/retirer un layout utilisateur | `saveLayoutTemplate()`, `removeLayoutTemplate()` |

Le catalogue configuré alimente à la fois l’éditeur et les commandes d’agent.
Un agent ne doit jamais utiliser un layout qui n’est pas offert.

Les peintures acceptent les jetons `background`, `surface`, `text`, `muted`,
`accent`, `accentSoft`, une couleur `#rrggbb`, ou `none`. Les jetons suivent un
changement de thème ; les couleurs fixes n’en suivent aucun.

## Modèles nommés

Un objet texte ou image peut porter `field` :

- `key` stable et unique dans la slide ;
- `kind`: `text`, `list` ou `image` ;
- `label`, `instruction`, `required`, `separator`, `hideWhenEmpty`.

Utiliser `templateFieldsOfSlide()` pour découvrir les champs,
`fillPresentationTemplate()` pour un lot et
`setPresentationTemplateField()` pour un champ. Le contenu change ; la boîte,
le groupe, le plan, le cadrage et les effets ne changent pas. Les anciens slots
`title` et `body` restent compatibles.

## Habillages

Un habillage est un ensemble d’objets répétés sans copie dans chaque slide. Il
peut contenir logo, bandeau, titre courant et pagination, derrière ou devant le
contenu. Variables : `{page}`, `{total}`, `{deck}`, `{slide}`, `{date}`.

| Besoin | API |
|---|---|
| Édition visuelle autonome | `PresentationDressingEditor` |
| Lister et résoudre | `documentDressings()`, `dressingOfSlide()` |
| Produire les calques rendus | `dressingLayersFor()` |
| Rendre les anciens repères explicites | `withExplicitDressings()` |

Les ids, groupes, `groupId`, assets et plans doivent survivre à la sauvegarde.

## Assets, images et icônes

- Sans magasin hôte, une image importée peut rester en data URL dans le deck.
- Avec `host.assets`, `upload()` stocke le fichier et `resolve()` fournit une
  URL fraîche au rendu/export ; le document conserve la clé stable.
- `host.images` expose une ou plusieurs bibliothèques avec recherche, filtres,
  pagination et résolution. `createHttpImageSource()` adapte une API HTTP.
- `host.icons` peut utiliser `createIconifyIconProvider()` ou un fournisseur
  interne. L’asset SVG intégré reste immuable ; chaque instance porte son
  `colorMap`.
- Les images chargées par URL doivent autoriser le GET CORS depuis l’app.

Ne jamais enregistrer un jeton, une URL temporaire ou un secret dans l’asset.

## Composants Vue

| Composant | Rôle |
|---|---|
| `PresentationWorkspace` | deck complet : rail, canevas, outils, inspecteurs, lecture et exports |
| `PresentationDressingEditor` | habillage seul avec thème/assets d’un document de référence |
| `PresentationSlideEditor` | layout enregistré seul, sans rail ni exports |
| `PresentationSlideThumbnail` | vignette SVG légère pour slide, layout ou favori |
| `renderSlideSnapshot` | rendu ponctuel d’une slide pour aperçu |

`PresentationWorkspace` propose les variantes `deck`, `slide` et `dressing`.
L’intégration détaillée est dans [host-integration.md](host-integration.md).

## Enregistrement et exports

`definePresentationHost()` fournit les défauts navigateur. L’hôte peut
surcharger :

- `save` et `autosaveDelay` ;
- `saveExport` pour recevoir les octets PDF/PPTX ;
- `storage` pour préférences ;
- `readSystemFont` pour les polices ;
- `assets`, `images`, `icons`, métadonnées et starter deck.

Le PDF et le PPTX sont déclenchés depuis l’éditeur et remis à `saveExport`.
Le PPTX reste éditable, avec des limites de fidélité selon les fonctions du
format. Le contour de glyphes est continu ; un flou d’ombre PDF est approché.

## Diagnostic réel

`diagnosePresentationRender()` attend les polices et renvoie des objets
sérialisables avec `slideId`, `elementIds`, sévérité, message et métriques :

- `text-wrapped` : nombre de lignes différent du texte explicite ;
- `text-clipped` : contenu coupé par sa boîte ;
- `collision` : boîtes rendues incompatibles ;
- `font-fallback` : police demandée remplacée.

`collisions: "text"` évite le bruit des fonds ; `"all"` inspecte tout ;
`"none"` désactive ce contrôle. Déclarer les superpositions voulues par
`allowOverlapWith` ou `intentionalOverlaps`.

## Limites actuelles

- Pas d’import PPTX éditable.
- Pas d’animations, transitions ou coédition temps réel.
- Format 16:9 uniquement.
- Vue 3 pour l’interface.
- Plugin Obsidian desktop uniquement.
- Une validation JSON ou géométrique ne prouve pas la qualité visuelle : il
  faut un aperçu réel et, selon le changement, un test PDF/PPTX.
