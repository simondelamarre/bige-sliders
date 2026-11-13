# Format `*.bige-slides` — référence d’édition

Lire cette référence seulement pour modifier directement le JSON. Le format
actuel est `schemaVersion: 1` et le canevas logique mesure `1600 × 900`.

## Racine du document

```json
{
  "schemaVersion": 1,
  "id": "deck-uuid",
  "title": "Titre du deck",
  "width": 1600,
  "height": 900,
  "theme": {
    "fontFamily": "Inter",
    "headingFont": "Inter",
    "colors": {
      "background": "#0b1016",
      "surface": "#151d27",
      "text": "#f6f8fb",
      "muted": "#9caabd",
      "accent": "#5ee0c2",
      "accentSoft": "#1d4b40"
    }
  },
  "assets": {},
  "slides": []
}
```

Préserver les propriétés supplémentaires, notamment `theme.typography`,
`theme.chartPaletteId`, `dressings`, `defaultDressing` et `chrome`.

## Slide et groupe

```json
{
  "id": "slide-uuid",
  "name": "Message de la slide",
  "layout": "blank",
  "background": "background",
  "hidden": false,
  "dressing": "standard",
  "groups": [{ "id": "group-uuid", "name": "Bloc principal" }],
  "elements": []
}
```

`background`, les remplissages et les couleurs acceptent un token du thème ou
une couleur `#rrggbb`. `"none"` signifie transparent pour les peintures.

Chaque élément possède au minimum `id`, `name`, `type`, `x`, `y`, `width`,
`height` et `source`. Champs communs optionnels : `rotation`, `opacity`,
`locked`, `hidden`, `groupId`, `plane` (`back` ou `front`).

## Texte

```json
{
  "id": "text-uuid",
  "name": "Titre",
  "type": "text",
  "text": "Une conclusion claire",
  "x": 96,
  "y": 90,
  "width": 1408,
  "height": 150,
  "fontSize": 66,
  "fontWeight": "bold",
  "align": "left",
  "color": "text",
  "lineHeight": 1.02,
  "textStyle": "title",
  "source": "assistant"
}
```

Niveaux : `display`, `title`, `heading`, `subtitle`, `eyebrow`, `body`,
`quote`, `kpi`, `caption`, ou `custom`. Avec un niveau, le thème décide du
rendu ; `fontSize` reste requis par le format.

## Forme

```json
{
  "id": "shape-uuid",
  "name": "Carte",
  "type": "shape",
  "shape": "roundedRect",
  "x": 96,
  "y": 280,
  "width": 440,
  "height": 300,
  "fill": "surface",
  "stroke": "accentSoft",
  "strokeWidth": 2,
  "radius": 24,
  "source": "assistant"
}
```

Formes : `rect`, `roundedRect`, `card`, `pill`, `ellipse`, `triangle`,
`diamond`, `pentagon`, `hexagon`, `star`, `chevron`, `line`, `arrow`.

## Image et icône

Les éléments référencent un asset existant :

```json
{
  "id": "image-uuid",
  "name": "Photo",
  "type": "image",
  "assetId": "asset-photo",
  "fit": "cover",
  "x": 900,
  "y": 180,
  "width": 600,
  "height": 560,
  "radius": 24,
  "source": "assistant"
}
```

```json
{
  "id": "icon-uuid",
  "name": "Icône",
  "type": "icon",
  "assetId": "asset-icon",
  "colorMap": { "currentColor": "accent" },
  "x": 120,
  "y": 300,
  "width": 80,
  "height": 80,
  "source": "assistant"
}
```

Un asset image importé dans Obsidian contient une `key` relative au vault. Un
asset SVG ou icône intégré contient généralement un `src` en data URL. Préférer
l’éditeur pour les créer : il contrôle le type, assainit les SVG et stocke les
images au bon endroit.

## Graphique

```json
{
  "id": "chart-uuid",
  "name": "Évolution",
  "type": "chart",
  "chartType": "bar",
  "categories": ["T1", "T2", "T3"],
  "series": [{ "name": "Valeur", "values": [12, 18, 25], "color": "accent" }],
  "showValues": true,
  "showLegend": false,
  "x": 180,
  "y": 250,
  "width": 1240,
  "height": 500,
  "source": "assistant"
}
```

Types : `bar`, `line`, `area`, `pie`, `donut`, `radar`, `scatter`,
`waterfall`. Ne jamais inventer les valeurs : conserver leur source dans le
contenu ou les notes associées.

## Tableau

```json
{
  "id": "table-uuid",
  "name": "Comparaison",
  "type": "table",
  "rows": [[{ "text": "Option", "bold": true }, { "text": "Effet", "bold": true }], [{ "text": "A" }, { "text": "Rapide" }]],
  "columnWidths": [1, 2],
  "headerRows": 1,
  "fontSize": 24,
  "headerFill": "accentSoft",
  "bodyFill": "surface",
  "textColor": "text",
  "borderColor": "muted",
  "borderWidth": 1,
  "cellPadding": 16,
  "x": 120,
  "y": 230,
  "width": 1360,
  "height": 480,
  "source": "assistant"
}
```

`columnWidths` sont des poids relatifs. Une cellule accepte `fill`, `color`,
`bold`, `align`, `verticalAlign` et `fontSize`.

## Habillages

Un habillage est un calque répété :

```json
{
  "id": "standard",
  "name": "Standard",
  "elements": [],
  "groups": []
}
```

Ses textes peuvent utiliser `{page}`, `{total}`, `{deck}`, `{slide}` et
`{date}`. `defaultDressing` choisit l’habillage par défaut ; une slide peut
choisir un autre id ou `null` pour aucun.
