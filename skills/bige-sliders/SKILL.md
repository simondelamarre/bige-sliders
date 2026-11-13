---
name: bige-sliders
description: Créer, remplir, modifier ou contrôler des présentations bige-sliders, et intégrer ses composants Vue dans une application hôte. À utiliser pour les decks JSON, layouts, champs de modèles, habillages, exports PDF/PPTX et diagnostics de rendu bige-sliders.
---

# bige-sliders

Utiliser les API publiques de `bige-sliders`; ne pas dépendre de ses fichiers
internes. L’hôte reste responsable du stockage, de l’authentification, des
assets privés et des conventions métier.

## Choisir le bon niveau

- Deck ou slides par opérations d’agent : lire le catalogue, puis utiliser
  `applyDeckOperations` et `editSlideElements`. Renvoyer les refus à l’agent au
  lieu de corriger silencieusement.
- Modèle connu : inspecter `templateFieldsOfSlide`, puis appeler
  `fillPresentationTemplate`. Ne jamais déplacer ou redimensionner un objet
  pour remplacer son contenu.
- Habillage hors éditeur complet : monter `PresentationDressingEditor` avec le
  `v-model` de l’habillage et `v-model:reference-document` pour thème/assets.
- Contrôle final : attendre les polices via `diagnosePresentationRender`, puis
  traiter en priorité `text-clipped`, `collision` et `font-fallback`.

Pour une création ou une modification importante, lire d’abord
[la matrice des capacités et le parcours agent](references/capabilities.md).
Elle indique quelle API choisir, ce qui reste éditable et les limites des
exports. Ne charger le README complet que pour une signature ou un exemple
d’intégration précis.

## Invariants

- Conserver les ids, groupes, `groupId`, références d’assets et plans
  `front`/`back` existants.
- Utiliser les couleurs du thème (`background`, `surface`, `text`, `muted`,
  `accent`, `accentSoft`) sauf demande explicite de couleur fixe.
- Pour une image de modèle, remplacer seulement `assetId`; garder cadre,
  `fit`, rayon, ombre et masque.
- Un champ facultatif vide reste identifiable. Le masquer à l’export seulement
  si `hideWhenEmpty` le demande.
- Déclarer une superposition voulue avec `allowOverlapWith`; ne pas ignorer
  globalement les collisions.
- Vérifier PDF et PPTX quand un style visuel change. L’import PPTX éditable est
  hors périmètre.

## Validation d’une intégration

Construire le package, créer un tarball avec `npm pack`, installer ce tarball
dans l’application de démo, puis lancer son typecheck et son build. Cela vérifie
les mêmes exports, types et styles que recevra l’intégrateur.

Pour les signatures, exemples Vue, migrations et limites, lire
[le README public](../../README.md), section « API d’intégration ».
