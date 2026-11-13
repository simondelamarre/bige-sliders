---
name: bige-sliders-release
description: Préparer, vérifier et publier une release coordonnée de bige-sliders sur npm, le dépôt public GitHub, la release Obsidian et GitHub Pages. À utiliser pour publier une version, déployer la démo, créer une release GitHub ou mettre à jour BRAT.
---

# Release bige-sliders

La source reste privée dans `bige-ops`. Le dépôt public reçoit seulement la
documentation, la démo, les skills et les artefacts compilés autorisés.

Ne jamais publier, pousser, créer une release ou modifier le registre sans
autorisation explicite. Simon valide lui-même la clé de sécurité npm. Ne jamais
copier un secret, une source privée, `node_modules` ou un sourcemap dans le
dépôt public.

## Sources de vérité

- Code : `desktop/src/features/presentation/`.
- Package : `desktop/packages/bige-sliders/`.
- Plugin Obsidian : `desktop/packages/bige-sliders-obsidian/`.
- Miroir public : `packaging/bige-sliders-repo/`.
- Procédure interne complète : `docs/DEVELOPMENT_RELEASE_RUNBOOK.md`, section 8.

Lire [la checklist de release](references/release-checklist.md) avant toute
écriture distante et l’exécuter dans l’ordre. Une version npm doit exister
avant de pousser la démo publique qui la demande.
