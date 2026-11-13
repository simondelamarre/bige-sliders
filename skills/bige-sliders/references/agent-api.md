# Recettes API pour agents

Utiliser ces recettes quand un agent produit ou transforme un document avec le
package TypeScript. Les commandes ne modifient jamais l’objet reçu : toujours
réutiliser `result.document` après succès.

## 1. Créer un deck depuis le catalogue

```ts
import {
  applyDeckOperationsAtomic,
  createPresentationDocument,
  deckLayoutCatalog,
  summarizeDeck,
} from "bige-sliders";

let deck = createPresentationDocument("Revue hebdomadaire");
const catalog = deckLayoutCatalog();

// Choisir uniquement un layout présent dans catalog, selon sa propriété use.
const result = applyDeckOperationsAtomic(deck, [
  {
    op: "create_slide",
    layout: "cover",
    position: 1,
    slots: {
      title: "La qualité progresse, les délais restent à stabiliser",
      body: "Semaine 46 · données arrêtées au 13 novembre",
    },
  },
]);

if (!result.committed) {
  throw new Error(`Opération ${result.failedOperation.index}: ${result.failedOperation.message}`);
}
deck = result.document;
console.log(summarizeDeck(deck));
```

Opérations deck disponibles : `create_slide`, `update_slide`, `move_slide`,
`hide_slide`, `show_slide`, `delete_slide`. Préférer `hide_slide` si le retrait
doit être réversible. Les positions commencent à 1.

Un layout peut exiger `chart` ou `table`. Lire `DeckLayoutInfo.data` et fournir
les données dans la même opération. Ne jamais fabriquer une série manquante.

## 2. Modifier une slide libre

```ts
import {
  checkSlideLayout,
  describeSlide,
  editSlideElementsAtomic,
} from "bige-sliders";

const context = describeSlide(deck, slideId);
// Donner context au modèle : il contient les ids, boîtes et régions.

const edit = editSlideElementsAtomic(deck, slideId, [
  {
    op: "add_text",
    name: "Conclusion",
    text: "Les erreurs baissent de 18 %",
    x: 120,
    y: 180,
    width: 900,
    height: 100,
    style: "heading",
    color: "text",
  },
  {
    op: "add_shape",
    name: "Repère positif",
    shape: "pill",
    x: 120,
    y: 320,
    width: 340,
    height: 70,
    fill: "accentSoft",
    stroke: "accent",
  },
], {});

if (!edit.committed) {
  throw new Error(edit.failedOperation.message);
}
deck = edit.document;
const quickChecks = checkSlideLayout(deck, slideId);
```

Opérations élémentaires : `add_text`, `add_shape`, `add_icon`, `add_image`,
`add_arrow`, `update`, `delete`, `group`, `arrange`. Pour `update`, employer
l’id retourné par `describeSlide`; ne pas cibler un objet par son nom.

Les opérations `add_icon` attendent un dictionnaire `ResolvedIcons` où la clé
est le nom demandé et la valeur un `PresentationAsset` résolu ou un message
d’erreur. Les images doivent déjà être des assets valides du deck.

## 3. Utiliser une composition prête

```ts
import { composeOnSlide } from "bige-sliders";

const result = composeOnSlide(deck, slideId, "cards", {
  region: "content",
  clear_region: true,
  columns: 3,
  cards: [
    { title: "Qualité", value: "92 %", detail: "+4 pts" },
    { title: "Coût", value: "184 €", detail: "−7 %" },
    { title: "Erreurs", value: "11", detail: "−18 %" },
  ],
}, {});

if (result.rejected.length) throw new Error(result.rejected[0].message);
deck = result.document;
```

`steps`, `cards` et `flow` construisent une composition cohérente dans
`content`, `left` ou `right`. `clear_region` enlève uniquement les objets de la
région ; `remove` cible des ids précis.

## 4. Remplir un modèle nommé

```ts
import {
  fillPresentationTemplate,
  templateFieldsOfSlide,
} from "bige-sliders";

const fields = templateFieldsOfSlide(deck.slides[0]);
const values = {
  headline: "Trois progrès visibles cette semaine",
  highlights: ["Excel stable", "Questionnaire complet", "Coûts en baisse"],
  hero: { assetId: "asset-weekly-cover" },
  optional_note: null,
};

const result = fillPresentationTemplate(deck, deck.slides[0].id, values, {
  strict: true,
});

if (result.missingRequired.length || result.unknown.length) {
  throw new Error(JSON.stringify({
    missing: result.missingRequired,
    unknown: result.unknown,
  }));
}
deck = result.document;
```

Valeurs admises : chaîne pour `text`, tableau de chaînes pour `list`, asset ou
`{ assetId }` pour `image`, `null` pour vider. Avec `strict: true`, une clé
inconnue ou un champ requis vide est refusé.

Une image remplacée conserve sa boîte, `fit`, rayon, ombre, masque, groupe et
plan. Un champ facultatif vide avec `hideWhenEmpty` reste sélectionnable dans
l’éditeur mais n’apparaît pas au PDF/PPTX.

## 5. Modifier le thème sans figer les slides

```ts
import {
  checkThemeContrast,
  editDeckTheme,
  themeCatalog,
} from "bige-sliders";

const available = themeCatalog();
const themed = editDeckTheme(deck, {
  preset: available[0].id,
  colors: { accent: "#4f7cff" },
  font: "Inter",
  heading_font: "Inter",
});
deck = themed.document;
const contrastChecks = checkThemeContrast(deck);
```

Utiliser les jetons dans les objets. Un HEX posé directement sur un objet ne
change pas quand l’utilisateur choisit un autre thème.

## 6. Contrôler le rendu réel

```ts
import { diagnosePresentationRender } from "bige-sliders";

const diagnostics = await diagnosePresentationRender(deck, {
  collisions: "text",
  intentionalOverlaps: [["caption-id", "photo-id"]],
});

const blockers = diagnostics.filter(
  (item) => item.severity === "error" || item.code === "font-fallback",
);
```

Ordre de traitement recommandé :

1. `text-clipped` : agrandir la boîte, raccourcir ou réduire la typo ;
2. `collision` : déplacer/redimensionner, ou déclarer l’overlap s’il est voulu ;
3. `font-fallback` : charger la police ou choisir une police disponible ;
4. `text-wrapped` : vérifier si le retour à la ligne sert le message.

Le diagnostic attend `document.fonts.ready` et mesure dans le navigateur. Il
ne modifie pas le deck. Pour une superposition durable, ajouter l’id de l’autre
objet à `allowOverlapWith` sur l’élément.

## 7. Contrat de résultat pour un agent

Après une passe, retourner un objet ou un résumé équivalent :

```ts
{
  document: deck,
  changedSlides: [slideId],
  changes: result.changes ?? [],
  rejected: result.rejected ?? [],
  diagnostics,
  verified: {
    json: true,
    snapshot: true,
    pdf: false,
    pptx: false,
  },
}
```

Ne pas corriger silencieusement un refus en changeant de layout, de texte ou de
donnée : le modèle ou l’utilisateur doit voir la contrainte qui a échoué.

## 8. Lots atomiques et limites

- Deck : 20 opérations par défaut.
- Slide : 24 opérations.
- Découper un grand changement par intention : structure, contenu, puis style.
- Chaque lot doit pouvoir être relu humainement.
- Un échec atomique renvoie le document d’origine avec
  `failedOperation.index`, `op` et `message`.
- Utiliser les variantes partielles seulement si conserver les opérations
  valides malgré d’autres refus est explicitement souhaité.
