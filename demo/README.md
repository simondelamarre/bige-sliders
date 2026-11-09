# Démo de bige-sliders

Une app Vue 3 + Vite qui installe `bige-sliders` depuis npm, comme ton projet.
C’est le code de la [démo en ligne](https://simondelamarre.github.io/bige-sliders/).

```bash
npm install
npm run dev        # http://localhost:5173
npm run typecheck  # vue-tsc, avec les types publiés du package
npm run build      # dist/, servi par GitHub Pages
```

| Fichier | Ce qu’il montre |
|---|---|
| [`src/App.vue`](./src/App.vue) | L’éditeur monté comme dans le README : deck dans `localStorage`, hôte avec `save`, `@bookmark` et `@theme-save` stockés, conteneur qui a une hauteur, `v-model`, remontage par `:key`, et la surcharge des couleurs de l’interface (variables CSS, en commentaire). |
| [`src/agentExample.ts`](./src/agentExample.ts) | Compatible agents : une slide créée et remplie par opérations JSON, un refus expliqué, le contrôle de mise en page. Sans Vue : le même code tourne dans Node. |
| [`src/catalog.ts`](./src/catalog.ts) | Catalogue réglé au démarrage, avec les favoris et thèmes personnels gardés dans `localStorage` : un layout maison (« Chiffre phare »), un thème maison (« Braise », avec son habillage : filet, titre du deck, « {page} / {total} ») pour les nouveaux decks, des onglets réorganisés dans la galerie. |
| [`src/LayoutManager.vue`](./src/LayoutManager.vue) | Page « Mes layouts » : vignettes des favoris par onglet (`PresentationSlideThumbnail`), édition d’un favori seul (`PresentationSlideEditor`), suppression, chaque changement stocké. |
| [`src/imageSource.ts`](./src/imageSource.ts) | `host.images` : une bibliothèque d’images factice (recherche, filtre, pagination, enregistrement), sans réseau. |
| [`src/main.ts`](./src/main.ts) | Réglage du catalogue (avec les favoris et thèmes gardés), puis montage de l’app Vue. |
| [`vite.config.js`](./vite.config.js) | `base` à `/bige-sliders/` pour GitHub Pages (variable `DEMO_BASE`), à la racine sinon. |

Documentation complète du package : [README](../README.md) ou
[page npm](https://www.npmjs.com/package/bige-sliders).
