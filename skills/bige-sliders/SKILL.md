---
name: bige-sliders
description: Créer, lire, remplir, modifier, réorganiser, contrôler ou intégrer une présentation bige-sliders, notamment un fichier `*.bige-slides` dans Obsidian. À utiliser pour créer un deck, faire des slides, exploiter les commandes d’agent, remplir un modèle, éditer un habillage, intégrer les composants Vue, diagnostiquer le rendu ou préparer un export PDF/PPTX. Ne pas utiliser pour un PPTX ou PDF qui ne doit pas devenir un deck bige-sliders.
---

# Utiliser bige-sliders

## Résultat attendu

Livrer un deck éditable et vérifiable, sans casser le travail manuel :

1. le document respecte `schemaVersion: 1` et le canevas `1600 × 900` ;
2. les ids, groupes, assets, habillages, champs inconnus et objets non visés
   sont préservés ;
3. les modifications utilisent les API publiques ou un patch JSON ciblé ;
4. les refus d’opérations et diagnostics sont rapportés, jamais masqués ;
5. le rendu est contrôlé après chargement des polices ;
6. les limites non testées — aperçu, polices, images, PDF, PPTX — sont dites.

Le package ne gère ni stockage, ni authentification, ni conventions métier.
L’application hôte ou Obsidian en reste responsable.

## Choisir le parcours

| Demande | Parcours | Référence à lire |
|---|---|---|
| Créer ou modifier un `*.bige-slides` dans un vault | fichier Obsidian | [workflow Obsidian](references/obsidian-workflow.md), puis [format JSON](references/format-bige-slides.md) seulement si édition directe |
| Générer, remplir ou corriger un deck avec du code/LLM | API d’agent | [recettes API](references/agent-api.md) |
| Remplir un layout sans bouger ses objets | champs de modèle | [recettes API](references/agent-api.md), section modèles |
| Éditer un en-tête, pied, logo ou pagination | habillage | [intégration hôte](references/host-integration.md), section habillages |
| Intégrer l’éditeur dans une application Vue | composants et host | [intégration hôte](references/host-integration.md) |
| Comprendre tout ce qui est possible | matrice | [capacités et limites](references/capabilities.md) |
| Contrôler texte coupé, collision ou police substituée | diagnostic réel | [recettes API](references/agent-api.md), section contrôle |

Ne charger que les références nécessaires. Le README public sert de référence
de signature complète lorsque les types installés ne suffisent pas.

## Séquence obligatoire pour un agent

1. **Inspecter avant d’écrire.** Résumer le deck avec `summarizeDeck`, puis
   décrire les slides visées avec `describeSlide`. Dans un vault, trouver les
   fichiers avec `rg --files -g '*.bige-slides'` et ne pas deviner la cible.
2. **Choisir un layout offert.** Lire `deckLayoutCatalog()` au lieu d’inventer
   un id. Pour un modèle nommé, lire `templateFieldsOfSlide()`.
3. **Préparer un petit lot cohérent.** Préférer
   `applyDeckOperationsAtomic()` ou `editSlideElementsAtomic()` pour qu’un
   refus rende le document d’origine intact.
4. **Préserver la géométrie des modèles.** Remplacer le contenu d’un champ,
   jamais sa boîte. Une image remplacée garde cadre, `fit`, rayon, masque,
   groupe et plan.
5. **Utiliser le thème.** Employer `background`, `surface`, `text`, `muted`,
   `accent`, `accentSoft`; réserver les HEX fixes aux demandes explicites.
6. **Contrôler en deux passes.** Exécuter `checkSlideLayout()` pour le contrôle
   rapide, puis `diagnosePresentationRender()` après `document.fonts.ready`
   sur les slides touchées.
7. **Rendre compte.** Retourner changements, refus, diagnostics restants et
   exports réellement testés. Ne jamais annoncer « valide visuellement » sur
   la seule foi d’un JSON valide.

## Invariants de contenu et de design

- Une idée principale par slide ; le titre affirme le message.
- Garder les textes courts et les chiffres sourcés. Ne jamais inventer une
  valeur de graphique ou de tableau.
- Garder chaque objet dans `1600 × 900`, avec marges et alignements cohérents.
- Conserver les ids stables. Tout nouvel objet reçoit un id unique et
  `source: "assistant"`.
- Préférer `hidden: true` à la suppression d’une slide quand le retrait doit
  rester réversible.
- Déclarer une superposition voulue avec `allowOverlapWith`; ne pas désactiver
  toutes les collisions.
- Un champ facultatif vide reste identifiable dans l’éditeur et ne disparaît
  à l’export que si `hideWhenEmpty: true`.
- Ne jamais inscrire un secret, une URL `blob:`/`app:` ou une URL présignée
  éphémère dans le document. Les assets privés sont résolus par l’hôte.

## Outils inclus dans ce skill

Pour un deck dans un vault :

```bash
node scripts/bige-slides.mjs inspect "/chemin/deck.bige-slides"
node scripts/bige-slides.mjs validate "/chemin/deck.bige-slides"
node scripts/bige-slides.mjs create "/chemin/Nouveau.bige-slides" "Titre"
```

`create` refuse d’écraser un fichier. `validate` contrôle la structure, les
ids, groupes, assets et limites du canevas ; il ne remplace pas le contrôle du
rendu dans l’éditeur.

## Contrôle final

- Examiner le diff : aucun objet, asset, habillage ou champ inconnu ne doit
  disparaître sans raison.
- Corriger `text-clipped`, collisions non voulues et `font-fallback` avant les
  simples informations de retour à la ligne.
- Vérifier les slides touchées dans l’éditeur ou avec un snapshot.
- Tester PDF **et** PPTX dès qu’un effet de texte, une police, un asset, un
  masque ou un habillage change.
- Pour une intégration npm, tester le tarball installé dans l’application de
  démo : les sources locales ne prouvent pas que les exports publiés marchent.

## Hors périmètre

- Import PPTX éditable, animations, transitions, édition temps réel et formats
  autres que 16:9.
- Obsidian mobile : le plugin est desktop uniquement.
- Publication npm/GitHub : ce skill explique l’usage du produit, pas son
  processus interne de release.
