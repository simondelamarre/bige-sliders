# Intégrer bige-sliders dans une application

Cette référence décrit le contrat technique public. L’application hôte garde
la maîtrise du stockage, de l’authentification, des URLs privées, des catalogues
métier et du déclenchement des exports.

## Installation et imports

```bash
npm install bige-sliders@^0.8.1 vue@^3
```

```ts
import {
  configurePresentationCatalog,
  createPresentationDocument,
  definePresentationHost,
  type PresentationDocument,
} from "bige-sliders";
import {
  PresentationDressingEditor,
  PresentationSlideEditor,
  PresentationSlideThumbnail,
  PresentationWorkspace,
} from "bige-sliders/vue";
import "bige-sliders/style.css";
```

Importer uniquement `bige-sliders` dans un service Node. Le point d’entrée Vue
charge les composants et les polices Inter ; il doit être monté côté client.

## Configurer le catalogue avant l’éditeur

```ts
configurePresentationCatalog({
  layouts: {
    includeBuiltIn: true,
    definitions: productLayouts,
    templates: savedLayouts,
    tabs: [
      { label: "Produit", layouts: ["product-cover", "product-kpi"] },
      { label: "Standard", layouts: ["cover", "statement", "chart"] },
    ],
  },
  themes: {
    definitions: productThemes,
    list: ["product-light", "product-dark"],
    default: "product-light",
  },
});
```

Appeler cette fonction une fois au démarrage, avant de monter un composant ou
d’appeler une commande d’agent. Un réglage incohérent lève
`PresentationCatalogError` sans modifier le catalogue précédent.

La galerie et l’agent lisent le même catalogue. Persister les événements
`bookmark` et `theme-save`, puis renvoyer leurs valeurs au démarrage.

## Définir le contrat hôte

```ts
const host = definePresentationHost({
  autosaveDelay: 800,

  async save(document, { reason }) {
    await api.saveDeck(document.id, document, { reason });
  },

  async saveExport(bytes, filename, kind) {
    return api.saveExport({ bytes, filename, kind });
  },

  storage: {
    getItem: (key) => localStorage.getItem(`slides:${key}`),
    setItem: (key, value) => localStorage.setItem(`slides:${key}`, value),
  },

  metadata: { author: "Équipe produit", company: "bige-ops" },
  assets: privateAssetStore,
  images: imageLibrary,
  icons: internalIconProvider,
  starterDeck: {
    label: "Nouveau deck",
    hint: "Présentation 16:9 éditable",
    create: (title) => createPresentationDocument(title),
  },
});
```

`definePresentationHost()` complète les propriétés absentes avec des défauts
navigateur. Sans `save`, le composant émet toujours `update:modelValue` mais
n’affiche pas d’état de sauvegarde. Une erreur de `save` doit être rejetée :
l’éditeur affiche l’échec et permet de réessayer.

## Monter l’éditeur complet

```vue
<script setup lang="ts">
import { ref } from "vue";
import type { PresentationDocument } from "bige-sliders";
import { PresentationWorkspace } from "bige-sliders/vue";

const deck = ref<PresentationDocument>(loadedDeck);
const editor = ref<InstanceType<typeof PresentationWorkspace>>();
</script>

<template>
  <div class="presentation-shell">
    <PresentationWorkspace
      ref="editor"
      v-model="deck"
      deck-name="Revue hebdomadaire"
      :host="host"
      appearance="light"
      @bookmark="persistLayout"
      @theme-save="persistTheme"
      @save-state="onSaveState"
      @fullscreen-change="onFullscreenChange"
    />
  </div>
</template>

<style>
.presentation-shell { height: 100dvh; min-height: 640px; }
</style>
```

Props principales :

- `modelValue?: PresentationDocument` ;
- `deckName: string` ;
- `initialUndo?: PresentationDocument` pour permettre d’annuler le lot agent
  appliqué juste avant l’ouverture ;
- `host`, lu au montage ;
- `appearance: "light" | "dark"`, qui change l’UI, jamais le thème des slides ;
- `variant: "deck" | "slide" | "dressing"`.

La méthode exposée `save()` force la sauvegarde en attente.

## Éditeur d’habillage autonome

```vue
<script setup lang="ts">
import { ref } from "vue";
import type {
  PresentationDocument,
  PresentationDressing,
} from "bige-sliders";
import { PresentationDressingEditor } from "bige-sliders/vue";

const dressing = ref<PresentationDressing>(loadedDressing);
const reference = ref<PresentationDocument>(loadedDeck);
</script>

<template>
  <div style="height: 720px">
    <PresentationDressingEditor
      v-model="dressing"
      v-model:reference-document="reference"
      :host="host"
      appearance="light"
    />
  </div>
</template>
```

Le `v-model` contient seulement l’habillage. `referenceDocument` fournit le
thème, les dimensions et les assets. `update:referenceDocument` est émis si un
asset change : persister **les deux** valeurs. L’éditeur conserve ids, groupes,
`groupId`, plans et références d’assets.

Les textes acceptent `{page}`, `{total}`, `{deck}`, `{slide}` et `{date}`. Un
objet `plane: "back"` passe sous le contenu ; `front` passe devant.

## Éditeur de layout et vignettes

`PresentationSlideEditor` reçoit un `PresentationLayoutTemplate` en `v-model`
et, facultativement, un document de référence. Il sert à gérer une galerie de
modèles sans rail, lecture ou exports.

```vue
<PresentationSlideEditor
  v-model="template"
  :document="referenceDeck"
  :host="host"
/>
```

`PresentationSlideThumbnail` est un SVG léger. Fournir l’une des combinaisons :

```vue
<PresentationSlideThumbnail :document="deck" :slide="deck.slides[0]" />
<PresentationSlideThumbnail :template="savedTemplate" />
<PresentationSlideThumbnail layout="metric-grid" />
```

Utiliser `renderSlideSnapshot()` pour produire un aperçu ponctuel lorsque le
composant n’est pas adapté.

## Assets privés

```ts
const privateAssetStore = {
  async upload(file: Blob, info: { name: string; mimeType: string }) {
    const stored = await api.upload(file, info);
    return { src: stored.previewUrl, key: stored.key };
  },
  async resolve(asset) {
    return api.freshSignedUrl(asset.key!);
  },
};
```

Le document garde `key`, jamais un secret. `resolve()` est rappelé au rendu et
à l’export ; sa réponse est mise en cache cinq minutes. L’URL doit supporter le
GET CORS depuis l’origine de l’application.

Pour une bibliothèque, fournir `host.images.sources`. Chaque source implémente
`search(query, signal)` et `resolve(item)`. `createHttpImageSource()` convient
à une API GET paginée et accepte des en-têtes recalculés à chaque requête.

## Exports et polices

Les boutons PDF/PPTX de l’éditeur produisent les octets puis appellent
`host.saveExport(bytes, filename, kind)`. Retourner un chemin/URL à afficher ou
`null` si l’utilisateur annule.

`readSystemFont(file)` permet au PDF d’embarquer une police locale. Sans elle,
Inter et les polices standard restent disponibles ; une substitution éventuelle
est signalée par `diagnosePresentationRender()`.

Recette obligatoire après un changement de rendu :

1. ouvrir le deck dans l’éditeur ;
2. attendre les polices ;
3. contrôler les diagnostics ;
4. exporter PDF et PPTX ;
5. ouvrir les deux fichiers et vérifier texte, assets, habillages et cadrage.

## SSR, lazy loading et isolation CSS

Dans Nuxt ou toute app SSR, charger l’entrée Vue côté client :

```ts
const PresentationWorkspace = defineAsyncComponent(() =>
  import("bige-sliders/vue").then((module) => module.PresentationWorkspace),
);
```

Monter l’éditeur dans un conteneur doté d’une hauteur explicite. Les styles du
package sont scopés sous `.deck-ui`; ne pas appliquer de reset global aux
éléments internes. Si l’hôte utilise un shadow DOM, injecter aussi
`bige-sliders/style.css` dans ce shadow root.

## Compatibilité et migrations

- Tous les champs introduits en 0.8.x sont facultatifs ; `schemaVersion` reste
  à `1`.
- Les anciens `slots.title` et `slots.body` sont reconnus comme champs de
  modèle `title` et `body`.
- Les anciens repères `chrome` sont convertis en habillage lors de la première
  modification explicite.
- Ne pas reconstruire un deck ancien : le charger et laisser les API préserver
  les propriétés inconnues.

## Tester exactement ce que reçoit l’intégrateur

```bash
# dans le package
npm pack

# dans l’application de démo
npm install --no-save ../bige-sliders/bige-sliders-0.8.1.tgz
npm run typecheck
npm run build
```

Tester le tarball, pas un alias vers les sources du monorepo. Vérifier au
minimum : habillage dynamique, modèle texte/liste/image, champ facultatif vide,
collision titre/sous-titre, exports PDF/PPTX et styles du composant monté.
