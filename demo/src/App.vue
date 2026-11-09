<script setup lang="ts">
import { ref } from "vue";
import { createPresentationDocument, createSlideFromLayout, definePresentationHost, type PresentationDocument } from "bige-sliders";
import { PresentationWorkspace } from "bige-sliders/vue";
import "bige-sliders/style.css";
import { runAgentExample } from "./agentExample";
import { forgetSaved, storeBookmark, storeThemes } from "./catalog";
import { demoImageLibrary } from "./imageSource";
import LayoutManager from "./LayoutManager.vue";

/**
 * Démo de bige-sliders, montée comme dans son README : un deck dans
 * `localStorage`, un hôte qui l’enregistre, l’éditeur dans un conteneur qui a
 * une hauteur. Les exports PDF et PPTX se téléchargent (défaut de l’hôte).
 */
const STORAGE_KEY = "bige-sliders-demo";

/** Deck de départ : cinq layouts livrés avec le package. */
function demoDeck(): PresentationDocument {
  const layouts = ["cover", "problem", "solution", "chart", "timeline"];
  return { ...createPresentationDocument("Démo bige-sliders"), slides: layouts.map((layout, index) => createSlideFromLayout(layout, index + 1)) };
}

function storedDeck(): PresentationDocument | undefined {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "null") ?? undefined;
  } catch {
    return undefined;
  }
}

const deck = ref<PresentationDocument>(storedDeck() ?? demoDeck());

// Sans réglage, les exports se téléchargent et les préférences vont dans localStorage.
const host = definePresentationHost({
  // Appelé après chaque modification (différé) et par ⌘S, avec le document à enregistrer.
  save: async (document) => localStorage.setItem(STORAGE_KEY, JSON.stringify(document)),
  metadata: { author: "Démo bige-sliders" },
  // Un onglet « Banque d’images » dans la galerie ; `createHttpImageSource` branche ton API.
  images: demoImageLibrary,
});

// `host` et `appearance` sont lus au montage : changer la clé remonte l’éditeur.
const editorKey = ref(0);
/** Le deck complet, ou la page de gestion des favoris. */
const view = ref<"deck" | "layouts">("deck");
const notice = ref("");

/** Repart de zéro : deck et réglages gardés par la démo (le catalogue se règle au chargement). */
function reset() {
  localStorage.removeItem(STORAGE_KEY);
  forgetSaved();
  location.reload();
}

/**
 * Le résultat d’un agent passe par `v-model` : l’éditeur l’affiche, ⌘Z l’annule.
 * L’éditeur n’enregistre que ses propres modifications : ce deck changé de
 * l’extérieur, c’est l’app qui l’enregistre.
 */
async function tryAgent() {
  const result = runAgentExample(deck.value);
  deck.value = result.document;
  await host.save?.(result.document, { reason: "manual" });
  const refused = result.rejected.map((item) => item.message).join(" ");
  notice.value = `Slide ${result.position} ajoutée : ${result.applied} opérations appliquées, ${result.rejected.length} refusée. ${refused}`;
}
</script>

<template>
  <div class="demo">
    <header class="hero">
      <div class="brand">
        <span class="mark" aria-hidden="true"><i /><i /><i /></span>
        <div>
          <p class="name">bige-sliders</p>
          <p class="tagline">L’éditeur de slides 16:9 pour Vue 3, à brancher dans ton app.</p>
        </div>
      </div>
      <ul class="features" aria-label="Ce que fait le package">
        <li>PDF et PPTX modifiable</li>
        <li>Layouts et onglets à toi</li>
        <li>Habillages : en-tête, pied, numéro</li>
        <li>Favoris de slides</li>
        <li>Pilotable par un agent</li>
      </ul>
      <nav class="actions">
        <div class="switch" role="tablist" aria-label="Vue de la démo">
          <button type="button" role="tab" :aria-selected="view === 'deck'" :class="view === 'deck' ? 'is-on' : ''" @click="view = 'deck'">Deck</button>
          <button type="button" role="tab" :aria-selected="view === 'layouts'" :class="view === 'layouts' ? 'is-on' : ''" @click="view = 'layouts'">Mes layouts</button>
        </div>
        <button type="button" class="ghost" title="Ajoute une slide par l’API agent (opérations JSON)" @click="tryAgent">Essayer l’API agent</button>
        <button type="button" class="ghost" @click="reset">Réinitialiser</button>
        <a class="ghost" href="https://github.com/simondelamarre/bige-sliders" target="_blank" rel="noopener">GitHub</a>
        <a class="ghost" href="https://stackblitz.com/github/simondelamarre/bige-sliders/tree/main/demo" target="_blank" rel="noopener">StackBlitz</a>
        <a class="cta" href="https://www.npmjs.com/package/bige-sliders" target="_blank" rel="noopener"><code>npm i bige-sliders</code></a>
      </nav>
      <p class="tips">À essayer : <b>⋯</b> sur une slide → « Enregistrer comme layout » · onglet <b>Thème</b> → « Habillages » → crayon. « Mes layouts » : vignettes et édition d’un favori seul. Tes favoris et thèmes reviennent au rechargement.</p>
      <p v-if="notice" class="notice" role="status">{{ notice }}</p>
    </header>
    <main class="editor">
      <LayoutManager v-if="view === 'layouts'" :document="deck" :host="host" />
      <PresentationWorkspace v-else :key="editorKey" v-model="deck" deck-name="Démo bige-sliders" :host="host" appearance="light" @bookmark="storeBookmark" @theme-save="storeThemes" />
    </main>
    <footer class="foot">Né dans <a href="https://bige.dev/" target="_blank" rel="noopener">bige-ops</a> · MPL-2.0</footer>
  </div>
</template>

<style scoped>
.demo { display: flex; flex-direction: column; height: 100vh; background: #f4f6f8; }
.hero {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: 10px 24px;
  padding: 14px 20px 12px;
  color: #eef2f6;
  background:
    radial-gradient(120% 140% at 0% 0%, rgb(62 224 192 / 0.16), transparent 55%),
    radial-gradient(90% 120% at 100% 0%, rgb(203 56 55 / 0.14), transparent 60%),
    #0e1116;
  font: 13px/1.4 Inter, system-ui, sans-serif;
}
.brand { display: flex; align-items: center; gap: 12px; }
.mark { display: grid; grid-template-rows: 6px 4px 4px; gap: 3px; width: 34px; height: 26px; padding: 5px; border-radius: 7px; background: #1a2029; box-shadow: inset 0 0 0 1px rgb(255 255 255 / 0.08); }
.mark i { display: block; border-radius: 2px; background: #3ee0c0; }
.mark i:nth-child(2) { width: 70%; background: #9aa4b2; }
.mark i:nth-child(3) { width: 45%; background: #9aa4b2; }
.name { margin: 0; font-size: 17px; font-weight: 700; letter-spacing: -0.01em; }
.tagline { margin: 2px 0 0; color: #9aa4b2; }
.features { grid-column: 1 / -1; grid-row: 2; display: flex; flex-wrap: wrap; gap: 6px; margin: 0; padding: 0; list-style: none; }
.features li { padding: 3px 9px; border: 1px solid rgb(62 224 192 / 0.35); border-radius: 999px; color: #c9f5ea; font-size: 11.5px; white-space: nowrap; }
.actions { display: flex; flex-wrap: wrap; align-items: center; justify-content: flex-end; gap: 6px; }
.switch { display: inline-flex; padding: 2px; border: 1px solid rgb(255 255 255 / 0.14); border-radius: 8px; }
.switch button { padding: 5px 10px; border: 0; border-radius: 6px; background: transparent; color: #9aa4b2; font: inherit; cursor: pointer; }
.switch button.is-on { background: #3ee0c0; color: #0e1116; font-weight: 600; }
.ghost { padding: 6px 10px; border: 1px solid rgb(255 255 255 / 0.14); border-radius: 7px; background: transparent; color: #eef2f6; font: inherit; text-decoration: none; cursor: pointer; }
.ghost:hover { border-color: rgb(62 224 192 / 0.6); color: #ffffff; }
.cta { padding: 6px 12px; border-radius: 7px; background: #cb3837; color: #ffffff; text-decoration: none; box-shadow: 0 6px 18px rgb(203 56 55 / 0.35); }
.cta:hover { background: #b02f2e; }
.cta code { font: 600 12.5px ui-monospace, SFMono-Regular, Menlo, monospace; }
.tips { grid-column: 1 / -1; margin: 0; color: #9aa4b2; font-size: 12px; }
.tips b { color: #eef2f6; font-weight: 600; }
.notice { grid-column: 1 / -1; margin: 0; padding: 6px 10px; border-radius: 7px; background: rgb(62 224 192 / 0.12); color: #c9f5ea; }
.editor { flex: 1; min-height: 0; }
.foot { padding: 4px 20px; font-size: 11px; color: #5b6573; background: #ffffff; border-top: 1px solid #dde1e7; }
.foot a { color: inherit; }
@media (max-width: 1100px) {
  .hero { grid-template-columns: 1fr; }
  .actions { justify-content: flex-start; }
}
</style>

<style>
/*
 * Reprendre ta charte dans l’interface de l’éditeur : variables en triplets RVB
 * (`R G B`), après l’import de bige-sliders/style.css. Décommente pour essayer.
 */
/*
:root .deck-ui[data-deck-appearance="light"] {
  --deck-accent: 37 99 235;
  --deck-accent-strong: 29 78 216;
  --deck-on-accent: 255 255 255;
}
*/
</style>
