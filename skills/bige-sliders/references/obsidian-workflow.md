# Workflow Obsidian pour un agent

Utiliser ce parcours pour un fichier `*.bige-slides` dans un vault. Il ne
requiert aucun MCP : l’agent travaille sur les fichiers locaux et le plugin
desktop bige-sliders assure le rendu et les exports.

## Avant d’écrire

1. Trouver la racine du vault (`.obsidian/`) et les decks :

   ```bash
   rg --files -g '*.bige-slides'
   ```

2. S’il existe plusieurs decks, identifier explicitement la cible.
3. Vérifier que le plugin communautaire `bige-sliders` est actif. S’il manque,
   expliquer l’installation via BRAT depuis `simondelamarre/bige-sliders` ; ne
   pas installer ni activer un plugin sans accord.
4. Lire le fichier entier et résumer titre, thème, ordre, slides masquées,
   habillages et nombre d’assets.
5. Vérifier l’état Git du vault et préserver tous les changements sans rapport.
6. Si le deck est ouvert dans l’éditeur, demander de fermer son onglet ou
   confirmer qu’aucune édition n’est en cours : l’autosave pourrait écraser le
   patch direct.

## Lire ou auditer

```bash
node scripts/bige-slides.mjs inspect "/vault/Deck.bige-slides"
node scripts/bige-slides.mjs validate "/vault/Deck.bige-slides"
```

Compléter par une lecture du JSON. `validate` ne mesure ni les polices ni le
rendu : un succès structurel n’autorise pas à conclure que le deck est lisible.

## Créer

Dans Obsidian, préférer la commande **Créer une présentation** : elle crée le
deck à côté de la note active avec les réglages du plugin.

Sans accès à l’interface :

```bash
node scripts/bige-slides.mjs create "/vault/Dossier/Deck.bige-slides" "Titre"
```

Le script refuse d’écraser un fichier. Construire ensuite le récit par petits
lots, valider, puis rouvrir dans Obsidian.

## Modifier directement le JSON

- Lire [format-bige-slides.md](format-bige-slides.md).
- Appliquer un patch ciblé ; ne jamais sérialiser à nouveau tout le deck si la
  demande porte sur quelques propriétés.
- Conserver `schemaVersion`, `id`, thème, habillages, assets et propriétés
  inconnues.
- Garder les ids existants. Un nouvel objet reçoit un id unique et stable,
  `source: "assistant"` et un `groupId` valide s’il rejoint un groupe.
- Préférer `hidden: true` à la suppression d’une slide réversible.
- Pour remplacer une image, modifier l’asset référencé ou `assetId`, sans
  toucher boîte, `fit`, rayon, ombre ou masque.
- Utiliser les jetons du thème pour que le toggle de thème reste fonctionnel.

## Images et icônes

- L’ajout depuis l’éditeur est le chemin le plus sûr : Obsidian écrit la pièce
  jointe dans le vault et garde une clé stable.
- Ne jamais inventer d’URL `app:`, `blob:` ou présignée.
- Ne pas déplacer une pièce jointe référencée sans mettre à jour sa clé et
  contrôler le rendu.
- Iconify est interrogé en ligne puis le SVG choisi est intégré au deck.

## Exports

Les boutons PDF/PPTX du plugin écrivent les fichiers à côté du deck. Une
modification JSON n’est pas un export. Tester les deux formats après un
changement de police, effet de texte, image, masque ou habillage.

## Contrôle final

1. Exécuter `validate` et corriger toutes les erreurs.
2. Examiner le diff : pas de disparition d’asset, groupe, habillage ou champ
   inconnu ; pas de réécriture globale injustifiée.
3. Rouvrir le deck dans Obsidian et vérifier chaque slide touchée : texte coupé,
   collision, contraste, cadrage, ordre des calques et cohérence du thème.
4. Déclencher PDF/PPTX lorsque le rendu ou les assets ont changé.
5. Si Obsidian n’est pas accessible, dire clairement que le contrôle visuel et
   les exports restent à faire.

## Pièges fréquents

- JSON valide sans `schemaVersion: 1`, thème ou dictionnaire `assets`.
- Identifiants dupliqués dans slides, objets ou habillages.
- `groupId` ou `assetId` introuvable.
- Valeur fixe HEX qui empêche un objet de suivre le thème.
- Modification pendant que l’onglet autosauvegarde.
- Validation structurelle confondue avec validation visuelle.
- Tentative d’utiliser le plugin sur Obsidian mobile.
