<script setup lang="ts">
import { ref } from "vue";
import { createPresentationDocument, createSlideFromLayout, definePresentationHost, type PresentationDocument } from "bige-sliders";
import { PresentationWorkspace } from "bige-sliders/vue";
import "bige-sliders/style.css";
import { runAgentExample } from "./agentExample";

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
});

// `host` et `appearance` sont lus au montage : changer la clé remonte l’éditeur.
const editorKey = ref(0);
const notice = ref("");

function reset() {
  localStorage.removeItem(STORAGE_KEY);
  deck.value = demoDeck();
  editorKey.value += 1;
  notice.value = "";
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
    <header class="bar">
      <strong>bige-sliders</strong>
      <span class="tagline">Éditeur de slides 16:9 pour Vue 3 · exports PDF et PPTX · compatible agents</span>
      <nav>
        <button type="button" title="Ajoute une slide par l’API agent (opérations JSON)" @click="tryAgent">Essayer l’API agent</button>
        <button type="button" @click="reset">Réinitialiser</button>
        <a href="https://github.com/simondelamarre/bige-sliders" target="_blank" rel="noopener">GitHub</a>
        <a href="https://stackblitz.com/github/simondelamarre/bige-sliders/tree/main/demo" target="_blank" rel="noopener">StackBlitz</a>
        <a class="cta" href="https://www.npmjs.com/package/bige-sliders" target="_blank" rel="noopener">Installer depuis npm</a>
      </nav>
      <p v-if="notice" class="notice" role="status">{{ notice }}</p>
    </header>
    <main class="editor">
      <PresentationWorkspace :key="editorKey" v-model="deck" deck-name="Démo bige-sliders" :host="host" appearance="light" />
    </main>
    <footer class="foot">Né dans <a href="https://bige.dev/" target="_blank" rel="noopener">bige-ops</a> · MPL-2.0</footer>
  </div>
</template>

<style scoped>
.demo { display: flex; flex-direction: column; height: 100vh; }
.bar { display: flex; flex-wrap: wrap; align-items: center; gap: 6px 16px; padding: 8px 16px; background: #ffffff; border-bottom: 1px solid #dde1e7; font-size: 13px; color: #1f2733; }
.tagline { color: #5b6573; }
nav { display: flex; flex-wrap: wrap; align-items: center; gap: 6px 14px; margin-left: auto; }
nav a, nav button { color: #0b7566; text-decoration: none; font: inherit; background: none; border: 0; padding: 0; cursor: pointer; }
nav a:hover, nav button:hover { text-decoration: underline; }
nav .cta { padding: 6px 12px; border-radius: 6px; background: #cb3837; color: #ffffff; font-weight: 600; }
nav .cta:hover { text-decoration: none; background: #a82e2d; }
.notice { flex-basis: 100%; margin: 0; color: #0b7566; }
.editor { flex: 1; min-height: 0; }
.foot { padding: 4px 16px; font-size: 11px; color: #5b6573; background: #ffffff; border-top: 1px solid #dde1e7; }
.foot a { color: inherit; }
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
