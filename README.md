# bige-sliders

<p align="center">
  <a href="https://www.npmjs.com/package/bige-sliders"><img src="https://img.shields.io/npm/v/bige-sliders?style=for-the-badge&logo=npm&label=Installer%20depuis%20npm&color=cb3837" alt="Installer bige-sliders depuis npm" height="36" /></a>
  &nbsp;
  <a href="https://simondelamarre.github.io/bige-sliders/"><img src="https://img.shields.io/badge/D%C3%A9mo-en%20ligne-0f8f7e?style=for-the-badge" alt="Démo en ligne" height="36" /></a>
  &nbsp;
  <a href="https://stackblitz.com/github/simondelamarre/bige-sliders/tree/main/demo"><img src="https://img.shields.io/badge/StackBlitz-modifier%20la%20d%C3%A9mo-1389fd?style=for-the-badge&logo=stackblitz&logoColor=white" alt="Modifier la démo dans StackBlitz" height="36" /></a>
</p>

Éditeur de slides 16:9 pour Vue 3, rendu avec Fabric, avec exports PDF et PPTX
construits dans le navigateur (PPTX modifiable : formes, tracés, dégradés,
masques, tableaux, graphiques). L’éditeur ne connaît ni ton application ni ton
stockage : tout ce qui en dépend passe par un **hôte** que tu fournis.

**Compatible agents par principe** : tout ce que fait l’interface, un agent
(LLM) peut le faire par des opérations JSON, sans Vue ni navigateur
(voir [Compatible agents](#compatible-agents)).

> Version 0.2 : l’API peut encore bouger avant la 1.0. Les changements sont
> listés dans le [CHANGELOG](https://github.com/simondelamarre/bige-sliders/blob/main/CHANGELOG.md).

Un outil simple pour des cas simples : faire des slides propres dans une
webapp et les sortir en PDF ou en PowerPoint, sans réinventer la roue.

## Sommaire

- [Démo](#démo)
- [Installation](#installation)
- [Démarrage rapide](#démarrage-rapide)
- [Le composant `PresentationWorkspace`](#le-composant-presentationworkspace)
- [L’hôte : `definePresentationHost`](#lhôte--definepresentationhost)
- [Exemples d’hôte](#exemples-dhôte)
- [Le document](#le-document)
- [Apparence de l’interface](#apparence-de-linterface)
- [Chargement à la demande, Nuxt](#chargement-à-la-demande-nuxt)
- [Compatible agents](#compatible-agents)
- [Raccourcis clavier](#raccourcis-clavier)
- [Entrées du package](#entrées-du-package)
- [Ce que le package ne fait pas](#ce-que-le-package-ne-fait-pas)

## Démo

- **En ligne** : [simondelamarre.github.io/bige-sliders](https://simondelamarre.github.io/bige-sliders/)
- **À modifier dans le navigateur** : [ouvrir dans StackBlitz](https://stackblitz.com/github/simondelamarre/bige-sliders/tree/main/demo)
- **Code de la démo** : [`demo/`](https://github.com/simondelamarre/bige-sliders/tree/main/demo),
  une app Vue 3 + Vite qui installe le package depuis npm, comme ton projet.
  En local :

```bash
git clone https://github.com/simondelamarre/bige-sliders.git
cd bige-sliders/demo
npm install
npm run dev
```

## Installation

```bash
npm install bige-sliders vue
```

Vue 3.5 ou plus est requis (dépendance pair). Fabric, pdf-lib, PptxGenJS et la
police Inter sont installés avec le package : rien d’autre à configurer, ni
Tailwind ni plugin Vite.

## Démarrage rapide

Un composant Vue qui garde le deck dans `localStorage` :

```vue
<script setup lang="ts">
import { ref } from "vue";
import { definePresentationHost, type PresentationDocument } from "bige-sliders";
import { PresentationWorkspace } from "bige-sliders/vue";
import "bige-sliders/style.css";

const deck = ref<PresentationDocument | undefined>(JSON.parse(localStorage.getItem("deck") || "null") ?? undefined);

// Sans réglage, les exports PDF et PPTX se téléchargent et les préférences vont dans localStorage.
const host = definePresentationHost({
  // Appelé après chaque modification (différé) et par ⌘S, avec le document à enregistrer.
  save: async (document) => localStorage.setItem("deck", JSON.stringify(document)),
});
</script>

<template>
  <div style="height: 100vh">
    <PresentationWorkspace v-model="deck" deck-name="Mon deck" :host="host" appearance="light" />
  </div>
</template>
```

Trois choses à retenir :

1. **Donne une hauteur au conteneur** : l’éditeur occupe toute la hauteur et
   toute la largeur de son parent.
2. **Importe `bige-sliders/style.css` une fois** dans l’app. Ses styles sont
   limités aux conteneurs de l’éditeur (`.deck-ui`) et ne touchent pas le
   reste de ta page.
3. **Sans deck** (`undefined`), l’éditeur propose d’en créer un (voir
   `starterDeck`). Tu peux aussi lui passer un deck créé par code
   ([Le document](#le-document)).

## Le composant `PresentationWorkspace`

### Props

| Prop | Type | Défaut | Rôle |
|---|---|---|---|
| `v-model` (`modelValue`) | `PresentationDocument \| undefined` | — | Le deck édité. L’éditeur émet une copie à chaque modification ; tu peux aussi le remplacer de l’extérieur (un agent, un chargement) : le remplacement s’annule par ⌘Z. L’éditeur n’enregistre que ses propres modifications : un deck que tu remplaces, c’est à toi de l’enregistrer. |
| `deck-name` | `string` | **requis** | Nom du deck : titre d’un deck créé depuis l’éditeur et nom des fichiers exportés. Le changer vide l’historique d’annulation (autre deck ouvert). |
| `host` | `PresentationHost` | défauts navigateur | Ce que ton application fournit : enregistrement, exports, images, icônes… Lu une fois, au montage. Voir [L’hôte](#lhôte--definepresentationhost). |
| `appearance` | `"light" \| "dark"` | `"dark"` | Interface claire ou sombre, lue au montage. Les slides gardent leur propre thème. |
| `initial-undo` | `PresentationDocument \| null` | — | Version précédente du deck, proposée comme première annulation (par exemple après un remplacement fait juste avant d’ouvrir l’éditeur). |

`host` et `appearance` sont lus au montage : pour en changer, remonte
l’éditeur (`:key`).

### Événements

| Événement | Charge | Quand |
|---|---|---|
| `update:modelValue` | `PresentationDocument` | À chaque modification (c’est ce que lit `v-model`). |
| `save-state` | `PresentationSaveState` | Avec un `save` fourni : `pending`, `saving`, `saved` (avec `at`), `error` (avec `message`). L’éditeur l’affiche déjà ; l’événement sert si tu veux l’afficher ailleurs. |

### Méthode exposée

`save()` enregistre tout de suite ce qui attend (comme ⌘S) et rejette si ton
`save` échoue :

```vue
<script setup lang="ts">
import { ref } from "vue";
import { PresentationWorkspace } from "bige-sliders/vue";

const editor = ref<InstanceType<typeof PresentationWorkspace>>();

async function beforeLeave() {
  await editor.value?.save();
}
</script>

<template>
  <PresentationWorkspace ref="editor" v-model="deck" deck-name="Mon deck" :host="host" />
</template>
```

## L’hôte : `definePresentationHost`

`definePresentationHost(overrides)` part des défauts navigateur et remplace ce
que tu fournis. Tu ne passes que ce que tu changes.

| Champ | Type | Défaut | Rôle |
|---|---|---|---|
| `save` | `(document, { reason: "auto" \| "manual" }) => Promise<void>` | aucun | Enregistre le deck (API, fichier, S3…). Appelé `autosaveDelay` ms après la dernière modification, et par ⌘S (`reason: "manual"`). Un seul enregistrement à la fois ; la dernière version gagne. Rejeter affiche l’échec et « Réessayer ». Sans `save`, aucun état d’enregistrement n’est affiché : tu enregistres toi-même depuis `v-model`. |
| `autosaveDelay` | `number` | `800` | Délai sans modification, en millisecondes, avant l’enregistrement automatique. |
| `saveExport` | `(bytes, filename, kind: "pdf" \| "pptx") => Promise<string \| null>` | téléchargement | Reçoit les octets d’un export. Renvoie l’emplacement à afficher, ou `null` si l’utilisateur annule. |
| `storage` | `{ getItem(key), setItem(key, value) }` | `localStorage`, préfixe `presentation-editor.` | Préférences de l’utilisateur : couleurs récentes, dégradés et thèmes enregistrés, tailles des panneaux. |
| `assets` | `{ upload(file, info), resolve?(asset) }` | aucun | Magasin d’images. Sans lui, une image importée reste dans le document en base64 ; avec lui, le document ne garde que son URL et sa clé. |
| `icons` | `PresentationIconProvider \| null` | Iconify (API publique) | Recherche d’icônes de la galerie. `null` retire la recherche en ligne. |
| `readSystemFont` | `(file: string) => Promise<Uint8Array>` | aucun | Lit une police installée sur le poste pour l’embarquer dans le PDF (app desktop, Electron, Tauri). |
| `metadata` | `{ author?, company? }` | `{}` | Inscrit dans les fichiers PDF et PPTX exportés. |
| `starterDeck` | `{ label, hint, create(title) }` | une slide de couverture | Proposé quand le deck est vide. |

Les types sont exportés : `PresentationHost`, `PresentationSave`,
`PresentationAssetStore`, `PresentationIconProvider`, `PresentationStorage`,
`PresentationStarterDeck`.

## Exemples d’hôte

### Enregistrer dans ton API

```ts
import { definePresentationHost } from "bige-sliders";

const host = definePresentationHost({
  autosaveDelay: 1500,
  save: async (document) => {
    const response = await fetch(`/api/decks/${deckId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(document),
    });
    // Une erreur levée ici affiche l’échec dans l’éditeur, avec « Réessayer ».
    if (!response.ok) throw new Error(`Enregistrement refusé (${response.status})`);
  },
});
```

Le chargement reste à toi : lis le deck depuis ton API et passe-le par
`v-model`.

### Envoyer les exports à ton serveur

```ts
const host = definePresentationHost({
  saveExport: async (bytes, filename, kind) => {
    const body = new Blob([bytes], { type: kind === "pdf" ? "application/pdf" : "application/vnd.openxmlformats-officedocument.presentationml.presentation" });
    const response = await fetch(`/api/exports/${encodeURIComponent(filename)}`, { method: "POST", body });
    if (!response.ok) throw new Error("Export non enregistré");
    return filename; // affiché à l’utilisateur
  },
});
```

### Ranger les images dans S3 (ou ailleurs)

```ts
const host = definePresentationHost({
  assets: {
    // Reçoit l’image importée ; renvoie son URL et, pour un stockage privé, sa clé.
    upload: async (file, { name, mimeType }) => {
      const { uploadUrl, key } = await fetch("/api/uploads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, mimeType }),
      }).then((response) => response.json());
      await fetch(uploadUrl, { method: "PUT", body: file, headers: { "Content-Type": mimeType } });
      return { src: `https://cdn.exemple.com/${key}`, key };
    },
    // Pour un bucket privé : une URL présignée fraîche. L’éditeur garde chaque réponse 5 minutes.
    resolve: async (asset) => (await fetch(`/api/uploads/${asset.key}/url`).then((response) => response.json())).url,
  },
});
```

Les URL doivent autoriser le `GET` depuis l’origine de ton app (CORS) : la
scène et les exports relisent les images dans le navigateur.

### Préférences, icônes, métadonnées, deck de départ

```ts
import { createPresentationDocument, createSlideFromLayout, definePresentationHost } from "bige-sliders";

const host = definePresentationHost({
  // Préférences par utilisateur, dans ton espace de noms.
  storage: {
    getItem: (key) => localStorage.getItem(`user-42.${key}`),
    setItem: (key, value) => localStorage.setItem(`user-42.${key}`, value),
  },
  // Pas de recherche d’icônes en ligne (réseau fermé, politique de confidentialité).
  icons: null,
  metadata: { author: "Camille Martin", company: "Exemple SAS" },
  starterDeck: {
    label: "Créer un rapport",
    hint: "Couverture, chiffres clés et calendrier.",
    create: (title) => ({
      ...createPresentationDocument(title),
      slides: [createSlideFromLayout("cover", 1), createSlideFromLayout("metric-grid", 2), createSlideFromLayout("timeline", 3)],
    }),
  },
});
```

## Le document

Un deck est un objet JSON (`PresentationDocument`) : titre, thème, slides de
1600 × 900, éléments positionnés (textes, formes, tracés, images, icônes,
tableaux, graphiques, groupes, masques) et images (`assets`). Tu peux le
garder tel quel en base, dans un fichier ou dans un champ JSON.

Créer un deck par code :

```ts
import { createPresentationDocument, createSlideFromLayout } from "bige-sliders";

const deck = {
  ...createPresentationDocument("Bilan trimestriel"),
  slides: [
    createSlideFromLayout("cover", 1, { title: "Bilan T3", body: "Équipe produit" }),
    createSlideFromLayout("metric-grid", 2),
    createSlideFromLayout("chart", 3),
  ],
};
```

Layouts livrés : `cover`, `problem`, `solution`, `statement`, `quote`, `image`,
`two-column`, `timeline`, `team`, `traction`, `metric-grid`, `chart`,
`data-table`, `market-size`, `comparison`, `competitive-matrix`, `pricing`.

Ajouter tes propres layouts ou thèmes, au démarrage de l’app, avant d’ouvrir
l’éditeur : `registerPresentationLayout(definition)` et
`registerPresentationTheme(preset)`. La galerie, l’ajout de slide et les
commandes pour agents les voient.

Aperçu d’une slide en image (miniature, partage) :

```ts
import { renderSlideSnapshot } from "bige-sliders/vue";

const jpegDataUrl = await renderSlideSnapshot(deck, deck.slides[0].id, 640);
```

## Apparence de l’interface

`appearance="light"` ou `"dark"` choisit l’interface de l’éditeur. Ses
couleurs sont des variables CSS en **triplets RVB** (`R G B`, sans `rgb()`),
pour que l’éditeur garde ses opacités. Pour reprendre ta charte :

```css
/* Après l’import de bige-sliders/style.css ; :root rend la règle prioritaire. */
:root .deck-ui[data-deck-appearance="light"] {
  --deck-accent: 37 99 235;        /* boutons, sélection */
  --deck-accent-strong: 29 78 216; /* textes et icônes d’accent */
  --deck-on-accent: 255 255 255;   /* texte posé sur l’accent */
  --deck-base: 241 245 249;        /* fond de l’éditeur */
}
```

Variables disponibles : `--deck-base`, `--deck-panel`, `--deck-raised`,
`--deck-line`, `--deck-line-strong`, `--deck-faint`, `--deck-muted`,
`--deck-text`, `--deck-accent`, `--deck-accent-strong`, `--deck-on-accent`,
`--deck-danger`, `--deck-danger-line`, `--deck-danger-soft`, `--deck-warning`,
`--deck-success`. Pour le thème sombre, cible
`:root .deck-ui[data-deck-appearance="dark"]`.

Les couleurs des **slides** ne viennent pas de là : elles suivent le thème du
deck, réglable dans l’éditeur (onglet Thème) ou par code (`editDeckTheme`).

## Chargement à la demande, Nuxt

L’éditeur embarque Fabric, pdf-lib et PptxGenJS (environ 900 Ko minifiés,
avant gzip) : charge-le à la demande pour garder une page d’accueil légère.

```ts
import { defineAsyncComponent } from "vue";

const PresentationWorkspace = defineAsyncComponent(() => import("bige-sliders/vue").then((module) => module.PresentationWorkspace));
```

L’éditeur dessine dans un `<canvas>` et lit le navigateur : il ne se rend que
côté client. Avec Nuxt, place-le dans `<ClientOnly>` et charge-le comme
ci-dessus. L’entrée `bige-sliders` (document, commandes) fonctionne aussi
côté serveur, dans Node.

## Compatible agents

bige-sliders est pensé pour être piloté par un agent (LLM) autant que par une
personne. L’entrée `bige-sliders` n’a pas besoin de Vue : des fonctions pures
reçoivent le document et des opérations JSON, appliquent ce qui est valide,
expliquent chaque refus et rendent un document toujours modifiable à la main.

| Fonction | Rôle pour l’agent |
|---|---|
| `summarizeDeck(deck)` | Résumé du deck à mettre dans le contexte du modèle. |
| `describeSlide(deck, slideId)` | Composition d’une slide : éléments, positions sur 1600 × 900, styles, régions libres, couleurs du thème. |
| `editSlideElements(deck, slideId, operations, icons)` | De 1 à 24 opérations : `add_text`, `add_shape`, `add_icon`, `add_image`, `add_arrow`, `update`, `delete`, `group`, `arrange`. |
| `composeOnSlide(deck, slideId, "steps" \| "cards" \| "flow", spec, icons)` | Compositions prêtes : étapes, cartes, flux. |
| `checkSlideLayout(deck, slideId)` | Contrôle : hors slide, texte qui déborde, chevauchements, texte trop petit, contraste. |
| `applyDeckOperations(deck, operations)`, `deckLayoutCatalog()` | Créer, remplir, déplacer, masquer ou supprimer des slides depuis les layouts. |
| `editDeckTheme(deck, edit)`, `checkThemeContrast(deck)` | Thème et contraste. |

```ts
import { checkSlideLayout, describeSlide, editSlideElements } from "bige-sliders";

const context = describeSlide(deck, slideId); // à donner au modèle
const result = editSlideElements(deck, slideId, [ // opérations JSON renvoyées par le modèle
  { op: "add_text", text: "Notre promesse", style: "title", x: 96, y: 120, width: 900, height: 120 },
  { op: "add_shape", shape: "roundedRect", x: 96, y: 300, width: 420, height: 220, fill: "accent", fill_opacity: 0.4, stroke: "none" },
], {});
// result.document : le deck modifié, à passer à v-model.
// result.applied : le nombre d’opérations appliquées.
// result.rejected : [{ index, op, message }], les refus expliqués, à renvoyer au modèle.
const checks = checkSlideLayout(result.document, slideId); // [{ code, ids, message }]
```

Couleurs : jetons du thème (`background`, `surface`, `text`, `muted`,
`accent`, `accentSoft`), `#rrggbb`, ou `none` pour un fond ou une bordure
absents ; `fill_opacity` et `stroke_opacity` de 0 à 1.

Passe `result.document` à `v-model` : l’éditeur affiche le changement, et
l’utilisateur peut l’annuler par ⌘Z. Enregistre-le toi-même : l’éditeur
n’enregistre que les modifications faites dans son interface. Exemple complet
dans la démo :
[`demo/src/agentExample.ts`](https://github.com/simondelamarre/bige-sliders/blob/main/demo/src/agentExample.ts).

Positions des slides (`position` de `applyDeckOperations`) : à partir de 1 ;
sans `position`, la slide est ajoutée à la fin.

## Raccourcis clavier

| Raccourci | Action |
|---|---|
| ⌘S / Ctrl+S | Enregistrer maintenant (avec `save`) |
| ⌘Z, ⇧⌘Z (Ctrl+Y) | Annuler, rétablir |
| ⌘C, ⌘X, ⌘V | Copier, couper, coller |
| ⌘D | Dupliquer la sélection (ou la slide) |
| Alt + glisser | Dupliquer en déplaçant |
| ⌘A | Tout sélectionner |
| ⌘G, ⇧⌘G | Grouper, dégrouper |
| ⌘], ⌘[ (⇧ : tout devant, tout derrière) | Avancer, reculer d’un plan |
| Flèches (⇧ : 10 px) | Déplacer la sélection |
| Maj pendant un déplacement | Garder l’axe |
| ⌘ pendant un déplacement | Sans magnétisme |
| P, V | Plume (reprend le tracé sélectionné), retour à la sélection |
| Suppr | Supprimer la sélection |
| Échap | Quitter la plume, un groupe ouvert, le plein écran ou la sélection |

## Entrées du package

| Import | Contenu |
|---|---|
| `bige-sliders` | Document et types, commandes pour agents et pour le code (voir [Compatible agents](#compatible-agents)), layouts et thèmes, contrat hôte, enregistrement différé (`PresentationAutosave`). Sans Vue, utilisable dans Node. |
| `bige-sliders/vue` | `PresentationWorkspace`, `renderSlideSnapshot`, `providePresentationHost`. |
| `bige-sliders/style.css` | Styles de l’éditeur, limités à ses conteneurs (`.deck-ui`), en clair ou en sombre. |

Le package est livré en modules ES, avec ses types TypeScript.

## Ce que le package ne fait pas

- Pas d’édition à plusieurs en temps réel.
- Format 16:9 seulement (1600 × 900).
- Pas d’import de fichiers PPTX ou PDF.
- Pas d’animations ni de transitions.
- Vue 3 seulement.
- Polices : Inter est livrée et embarquée dans le PDF ; les autres polices
  ne sont pas encore garanties à l’export.

## Retours

Un problème, un cas d’usage qui coince, une idée : ouvre une issue sur
[github.com/simondelamarre/bige-sliders](https://github.com/simondelamarre/bige-sliders/issues/new/choose).
Les retours sur l’installation et les cas d’usage sont les plus utiles : ils
servent à garder l’outil simple et la doc claire.

## Licence

[MPL-2.0](https://github.com/simondelamarre/bige-sliders/blob/main/LICENSE) © Simon Delamarre.
Utilisable librement, y compris dans une application fermée ou commerciale.
Le package est livré compilé, avec ses types TypeScript ; le code source
n’est pas publié.

La police Inter, livrée et embarquée dans les PDF, est sous licence SIL Open
Font License 1.1 (fichier `LICENSE-INTER.txt` du package).

---

Né dans [bige-ops](https://bige.dev/) : une application gratuite, installée
sur ton poste. Tu relies ton dépôt, tu simules ta stack, tu la testes en
local et tu la déploies sur ton propre compte cloud.
