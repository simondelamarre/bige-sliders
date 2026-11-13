# Checklist de release

## 1. Préparer sans publier

1. Inspecter branche, HEAD et fichiers modifiés. Ne pas embarquer les fichiers
   Obsidian ou changements utilisateur sans rapport.
2. Vérifier la même version dans :
   - `desktop/packages/bige-sliders/package.json`;
   - `desktop/packages/bige-sliders-obsidian/package.json`;
   - `desktop/packages/bige-sliders-obsidian/manifest.json`;
   - `packaging/bige-sliders-repo/manifest.json` et `versions.json`;
   - la dépendance de `packaging/bige-sliders-repo/demo/package.json`.
3. Synchroniser README et CHANGELOG du package vers le miroir public, puis
   vérifier les liens relatifs propres au dépôt public.
4. Valider le skill d’usage et ce skill avec `quick_validate.py`.

## 2. Recette du vrai artefact

Depuis `desktop/` :

```sh
npm run build:sliders
npm run build:sliders-obsidian
```

Depuis `desktop/packages/bige-sliders/`, lancer `npm publish --dry-run` et
contrôler que le tarball contient seulement `dist`, README, CHANGELOG,
licences et manifeste. Installer ensuite le tarball avec `--no-save` dans
`packaging/bige-sliders-repo/demo`, puis exécuter `npm run typecheck` et
`npm run build`.

Recette physique obligatoire : édition d’habillage et pagination, modèle avec
champs texte/liste/image, champ facultatif vide, diagnostic d’une collision,
export PDF/PPTX, transparence/arriére-plan/contour/ombre du texte et rail de
slides titre/vignette.

## 3. Publication coordonnée

Après autorisation explicite et depuis le commit validé :

1. Vérifier `npm whoami`, puis publier depuis
   `desktop/packages/bige-sliders/` avec `npx -y npm@latest publish`. Simon
   ouvre le lien dans les cinq minutes et valide sa clé de sécurité.
2. Vérifier sans se fier au cache : `npm view bige-sliders dist-tags.latest`
   et le registre npm. Installer `bige-sliders@latest` dans une app propre et
   refaire le smoke test.
3. Synchroniser `packaging/bige-sliders-repo/` vers le clone public en excluant
   `node_modules`, `dist`, `.vite`, `package-lock.json`, `.DS_Store` et `.git`.
   Examiner tout le diff avant commit/push ; aucune source privée ne doit
   apparaître.
4. Pousser `main` du dépôt public. Le workflow `Démo` construit GitHub Pages
   depuis npm. S’il ne part pas, lancer `demo.yml` manuellement.
5. Créer la release GitHub avec le tag exact `X.Y.Z` sans préfixe `v` et joindre
   `main.js`, `manifest.json`, `styles.css` produits par le build Obsidian.
   BRAT lit ces mêmes versions et artefacts.
6. Vérifier la page publique, la release, les trois assets, le manifeste et
   une installation/mise à jour BRAT réelle.

## 4. Règles d’échec

- Ne jamais réutiliser un numéro déjà publié ou retiré.
- Si npm échoue ou reste invisible au registre, ne pas pousser une démo qui
  dépend de cette version.
- Si Pages échoue, garder npm et la release intacts, corriger le workflow puis
  le relancer ; ne pas republier npm.
- Ne jamais corriger seulement le clone public : la prochaine synchronisation
  l’écraserait. Corriger d’abord `packaging/bige-sliders-repo/`.
