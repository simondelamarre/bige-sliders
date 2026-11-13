<script setup lang="ts">
import { computed, ref } from "vue";
import {
  createPresentationDocument,
  createSlideFromLayout,
  definePresentationHost,
  diagnosePresentationRender,
  fillPresentationTemplate,
  withExplicitDressings,
  type PresentationDocument,
  type PresentationDressing,
  type PresentationElement,
  type PresentationPaint,
  type PresentationSlide,
} from "bige-sliders";
import { PresentationDressingEditor, PresentationWorkspace } from "bige-sliders/vue";
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
const STORAGE_KEY = "bige-sliders-demo-v3";
const TEMPLATE_SLIDE_ID = "slide-6";
const COLLISION_SLIDE_ID = "slide-7";

// Symbole officiel de `desktop/public/bige-ops.svg`, embarqué pour que les
// exports fonctionnent aussi hors ligne et sur GitHub Pages.
const logoSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img" aria-label="bige-ops"><path d="M32 10 52 21v22L32 54 12 43V21z" fill="none" stroke="#3d9e8f" stroke-width="4" stroke-linejoin="round"/><circle cx="32" cy="32" r="7" fill="#5ec4b4"/></svg>`;
const logoSrc = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(logoSvg)}`;

function text(id: string, name: string, value: string, x: number, y: number, width: number, height: number, fontSize: number, color: PresentationPaint = "text", fontWeight: "normal" | "bold" = "normal"): PresentationElement {
  return { id, name, type: "text", text: value, x, y, width, height, fontSize, fontWeight, color, lineHeight: 1.08, textStyle: "custom", source: "manual" };
}

function box(id: string, name: string, x: number, y: number, width: number, height: number, fill: PresentationPaint = "surface", stroke: PresentationPaint = "none", radius = 24): PresentationElement {
  return { id, name, type: "shape", shape: "roundedRect", x, y, width, height, fill, stroke, strokeWidth: stroke === "none" ? 0 : 2, radius, source: "manual" };
}

function featureSlide(id: string, name: string, eyebrow: string, title: string, body: string, elements: PresentationElement[]): PresentationSlide {
  return {
    id,
    name,
    background: "background",
    elements: [
      text(`${id}-eyebrow`, "Repère", eyebrow.toUpperCase(), 100, 90, 900, 36, 18, "accent", "bold"),
      text(`${id}-title`, "Titre", title, 100, 142, 1360, 118, 54, "text", "bold"),
      text(`${id}-body`, "Contexte", body, 100, 268, 1240, 64, 24, "muted"),
      ...elements,
    ],
  };
}

/** Deck de départ : une promesse et quatre vraies slides produit, puis les recettes API. */
function demoDeck(): PresentationDocument {
  const base = createPresentationDocument("bige-ops — démonstration bige-sliders");
  base.assets["bige-ops-logo"] = { id: "bige-ops-logo", kind: "svg", src: logoSrc, mimeType: "image/svg+xml", name: "Symbole officiel bige-ops", alt: "Symbole bige-ops" };
  const slides = [
    createSlideFromLayout("cover", 1, { title: "Comprendre le cloud avant de déployer", body: "bige-ops rend l’infrastructure, les coûts et les risques lisibles avant toute action." }),
    featureSlide("slide-2", "Du dépôt au système", "01 · Modéliser", "Voir la stack comme un système, pas comme une liste", "Le dépôt devient une carte explicite : services, dépendances et cible cloud partagent le même modèle.", [
      box("s2-code", "Carte code", 110, 410, 360, 250, "surface", "accentSoft"),
      text("s2-code-label", "Titre code", "DÉPÔT", 150, 452, 280, 34, 17, "accent", "bold"),
      text("s2-code-value", "Contenu code", "Compose\nTerraform\nVariables", 150, 510, 280, 110, 28, "text", "bold"),
      { id: "s2-arrow-a", name: "Flux vers modèle", type: "shape", shape: "arrow", x: 500, y: 500, width: 120, height: 52, fill: "accent", stroke: "none", source: "manual" },
      box("s2-model", "Carte modèle", 650, 380, 390, 310, "accentSoft", "accent"),
      text("s2-model-label", "Titre modèle", "MODÈLE Bige Ops", 695, 425, 300, 34, 17, "accent", "bold"),
      text("s2-model-value", "Contenu modèle", "Topologie\nCoûts\nRisques", 695, 492, 300, 130, 34, "text", "bold"),
      { id: "s2-arrow-b", name: "Flux vers cloud", type: "shape", shape: "arrow", x: 1070, y: 500, width: 120, height: 52, fill: "accent", stroke: "none", source: "manual" },
      box("s2-cloud", "Carte cloud", 1220, 410, 270, 250, "surface", "accentSoft"),
      text("s2-cloud-label", "Titre cloud", "CIBLE", 1260, 452, 190, 34, 17, "accent", "bold"),
      text("s2-cloud-value", "Contenu cloud", "VM\nKubernetes\nManaged", 1260, 510, 190, 110, 27, "text", "bold"),
    ]),
    featureSlide("slide-3", "Coûts avant action", "02 · Chiffrer", "Comparer les coûts avant de provisionner", "Les hypothèses restent visibles : on comprend ce qui pèse, ce qui change et ce qui mérite une décision.", [
      box("s3-total", "Coût total", 110, 405, 500, 300, "accentSoft", "accent"),
      text("s3-total-label", "Libellé coût", "ESTIMATION MENSUELLE", 155, 452, 400, 34, 17, "accent", "bold"),
      text("s3-total-value", "Valeur coût", "€ / mois", 155, 510, 400, 95, 68, "text", "bold"),
      text("s3-total-note", "Note coût", "Avant tout déploiement", 155, 628, 390, 34, 20, "muted"),
      box("s3-compute", "Compute", 670, 415, 720, 72, "surface"),
      box("s3-compute-bar", "Barre compute", 690, 437, 430, 28, "accent", "none", 14),
      text("s3-compute-text", "Libellé compute", "Compute", 1145, 432, 190, 34, 20, "text", "bold"),
      box("s3-data", "Data", 670, 515, 720, 72, "surface"),
      box("s3-data-bar", "Barre data", 690, 537, 285, 28, "accentSoft", "none", 14),
      text("s3-data-text", "Libellé data", "Data", 1145, 532, 190, 34, 20, "text", "bold"),
      box("s3-network", "Network", 670, 615, 720, 72, "surface"),
      box("s3-network-bar", "Barre network", 690, 637, 170, 28, "muted", "none", 14),
      text("s3-network-text", "Libellé network", "Network", 1145, 632, 190, 34, 20, "text", "bold"),
    ]),
    featureSlide("slide-4", "Risques actionnables", "03 · Décider", "Transformer chaque risque en action priorisée", "Un signal n’est utile que s’il explique son impact et la prochaine décision à prendre.", [
      box("s4-critical", "Risque critique", 110, 410, 1380, 104, "surface", "accentSoft", 18),
      text("s4-critical-level", "Niveau critique", "PRIORITÉ 1", 145, 440, 180, 34, 17, "accent", "bold"),
      text("s4-critical-title", "Titre critique", "Secret exposé dans la configuration", 350, 433, 640, 44, 28, "text", "bold"),
      text("s4-critical-action", "Action critique", "→ externaliser avant déploiement", 1030, 440, 405, 34, 20, "muted"),
      box("s4-watch", "Risque à surveiller", 110, 540, 1380, 104, "surface", "none", 18),
      text("s4-watch-level", "Niveau surveillance", "À SURVEILLER", 145, 570, 180, 34, 17, "muted", "bold"),
      text("s4-watch-title", "Titre surveillance", "Capacité non bornée", 350, 563, 640, 44, 28, "text", "bold"),
      text("s4-watch-action", "Action surveillance", "→ définir une limite et une alerte", 1030, 570, 405, 34, 20, "muted"),
      text("s4-summary", "Synthèse", "Le risque, son contexte et l’action restent reliés au même modèle.", 110, 700, 1180, 52, 24, "accent", "bold"),
    ]),
    featureSlide("slide-5", "Déploiement ciblé", "04 · Opérer", "Déployer une cible sans toucher au reste", "La branche, le service et l’état final restent explicites : aucune mutation d’infrastructure implicite.", [
      ...["Commit validé", "Build ciblé", "Service déployé", "Santé vérifiée"].flatMap((label, index) => {
        const x = 110 + index * 360;
        const step: PresentationElement[] = [
          box(`s5-step-${index}`, `Étape ${index + 1}`, x, 430, 290, 190, index === 3 ? "accentSoft" : "surface", index === 3 ? "accent" : "none", 22),
          text(`s5-step-number-${index}`, `Numéro ${index + 1}`, `${index + 1}`.padStart(2, "0"), x + 28, 458, 70, 42, 22, "accent", "bold"),
          text(`s5-step-label-${index}`, label, label, x + 28, 520, 230, 62, 27, "text", "bold"),
        ];
        if (index < 3) step.push({ id: `s5-arrow-${index}`, name: `Flèche ${index + 1}`, type: "shape", shape: "arrow", x: x + 300, y: 500, width: 50, height: 34, fill: "accent", stroke: "none", source: "manual" });
        return step;
      }),
      text("s5-proof", "Preuve", "Ref exact · image exacte · statut final", 110, 680, 1380, 52, 24, "muted"),
    ]),
    createSlideFromLayout("image", 6, { title: "Un modèle rempli par l’application hôte", body: "Le cadre reste fixe quand la photo change." }),
    createSlideFromLayout("statement", 7, { title: "Un titre volontairement trop proche", body: "Le diagnostic doit désigner ce sous-titre et le titre après le changement de police." }),
  ];
  const template = slides[5];
  const templateTexts = template.elements.filter((element) => element.type === "text");
  if (templateTexts[0]) templateTexts[0].field = { key: "headline", kind: "text", label: "Titre", instruction: "Promesse bige-ops en une phrase", required: true };
  if (templateTexts[1]) templateTexts[1].field = { key: "benefits", kind: "list", label: "Bénéfices", instruction: "Trois bénéfices courts", separator: "\n" };
  const templateImage = template.elements.find((element) => element.type === "image");
  if (templateImage?.type === "image") {
    templateImage.field = { key: "visual", kind: "image", label: "Capture produit", instruction: "Visuel 16:9", hideWhenEmpty: true };
    templateImage.assetId = "";
  }
  const collisionTexts = slides[6].elements.filter((element) => element.type === "text");
  if (collisionTexts[0] && collisionTexts[1]) {
    collisionTexts[0].y = 230; collisionTexts[0].height = 150; collisionTexts[0].fontFamily = "Georgia"; collisionTexts[0].textStyle = "custom"; collisionTexts[0].fontSize = 74;
    collisionTexts[1].y = 330; collisionTexts[1].height = 90;
  }
  const explicit = withExplicitDressings({ ...base, slides });
  const dressing = explicit.dressings![0];
  dressing.name = "Identité bige-ops";
  dressing.elements.unshift(
    { id: "bige-ops-dressing-logo", name: "Symbole bige-ops", type: "image", assetId: "bige-ops-logo", fit: "contain", x: 64, y: 34, width: 58, height: 58, source: "manual", plane: "front" },
    { id: "bige-ops-dressing-wordmark", name: "Nom bige-ops", type: "text", text: "bige-ops", x: 132, y: 43, width: 220, height: 42, fontSize: 27, fontWeight: "bold", color: "text", textStyle: "custom", source: "manual", plane: "front" },
  );
  const coverTitle = slides[0].elements.find((element) => element.type === "text" && (element.textStyle === "display" || element.textStyle === "title"));
  if (coverTitle?.type === "text") {
    coverTitle.outline = { color: "background", width: 2 };
    coverTitle.shadow = { color: "text", opacity: .2, blur: 12, offsetX: 0, offsetY: 8 };
  }
  return explicit;
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
const view = ref<"deck" | "layouts" | "dressing" | "api">("deck");
const notice = ref("");
const diagnostics = ref<string[]>([]);
const activeDressing = computed<PresentationDressing>({
  get: () => deck.value.dressings?.[0] || { id: "demo", name: "Habillage", elements: [] },
  set: (value) => { deck.value = { ...deck.value, dressings: [value, ...(deck.value.dressings || []).slice(1)] }; },
});

function fillHostTemplate() {
  const result = fillPresentationTemplate(deck.value, TEMPLATE_SLIDE_ID, {
    headline: "bige-ops transforme une infrastructure complexe en décision lisible",
    benefits: ["Topologie explicite", "Coût estimé avant déploiement", "Risques reliés aux actions"],
  }, { strict: true });
  deck.value = result.document;
  notice.value = `${result.applied.length} champs remplis sans déplacer les objets.`;
}

function replaceTemplatePhoto() {
  deck.value = fillPresentationTemplate(deck.value, TEMPLATE_SLIDE_ID, { visual: "bige-ops-logo" }, { strict: true }).document;
  notice.value = "Image remplacée : cadre, ajustement et géométrie conservés.";
}

function clearOptionalPhoto() {
  deck.value = fillPresentationTemplate(deck.value, TEMPLATE_SLIDE_ID, { visual: null }, { strict: true }).document;
  notice.value = "Champ image facultatif vide : visible dans l’éditeur, masqué dans les exports.";
}

async function runDiagnostics() {
  const result = await diagnosePresentationRender(deck.value, { collisions: "text" });
  diagnostics.value = result.filter((item) => item.slideId === COLLISION_SLIDE_ID).map((item) => `${item.code} · ${item.elementIds.join(" + ")} · ${item.message}`);
  notice.value = `${result.length} diagnostic(s) structuré(s) sur le deck.`;
}

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
          <button type="button" role="tab" :aria-selected="view === 'dressing'" :class="view === 'dressing' ? 'is-on' : ''" @click="view = 'dressing'">Habillage autonome</button>
          <button type="button" role="tab" :aria-selected="view === 'api'" :class="view === 'api' ? 'is-on' : ''" @click="view = 'api'">API hôte</button>
        </div>
        <button type="button" class="ghost" title="Ajoute une slide par l’API agent (opérations JSON)" @click="tryAgent">Essayer l’API agent</button>
        <button type="button" class="ghost" @click="reset">Réinitialiser</button>
        <a class="ghost" href="https://github.com/simondelamarre/bige-sliders" target="_blank" rel="noopener">GitHub</a>
        <a class="ghost" href="https://stackblitz.com/github/simondelamarre/bige-sliders/tree/main/demo" target="_blank" rel="noopener">StackBlitz</a>
        <a class="cta" href="https://www.npmjs.com/package/bige-sliders" target="_blank" rel="noopener"><code>npm i bige-sliders</code></a>
      </nav>
      <p class="tips">Démo fondée sur <a href="https://bige.dev/" target="_blank" rel="noopener">bige-ops</a>. À essayer : rail en mode vignette/titre · contour et ombre du titre · habillage autonome · champs typés et diagnostic dans « API hôte ».</p>
      <p v-if="notice" class="notice" role="status">{{ notice }}</p>
    </header>
    <main class="editor">
      <LayoutManager v-if="view === 'layouts'" :document="deck" :host="host" />
      <PresentationDressingEditor v-else-if="view === 'dressing'" v-model="activeDressing" v-model:reference-document="deck" :host="host" appearance="light" />
      <div v-else-if="view === 'api'" class="scenario-view">
        <aside class="scenario-panel">
          <h2>Recette de l’API hôte</h2>
          <p>Les exemples modifient le même deck bige-ops que l’éditeur.</p>
          <button type="button" @click="fillHostTemplate">1. Remplir texte + liste</button>
          <button type="button" @click="replaceTemplatePhoto">2. Remplacer la photo</button>
          <button type="button" @click="clearOptionalPhoto">3. Vider le champ facultatif</button>
          <button type="button" @click="runDiagnostics">4. Diagnostiquer le rendu réel</button>
          <ul v-if="diagnostics.length"><li v-for="item in diagnostics" :key="item">{{ item }}</li></ul>
        </aside>
        <PresentationWorkspace :key="editorKey" v-model="deck" deck-name="bige-ops · API hôte" :host="host" appearance="light" @bookmark="storeBookmark" @theme-save="storeThemes" />
      </div>
      <PresentationWorkspace v-else :key="editorKey" v-model="deck" deck-name="bige-ops · Démo bige-sliders" :host="host" appearance="light" @bookmark="storeBookmark" @theme-save="storeThemes" />
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
.scenario-view { display: grid; grid-template-columns: 260px minmax(0, 1fr); height: 100%; min-height: 0; }
.scenario-panel { overflow: auto; padding: 18px; border-right: 1px solid #dde1e7; background: #fff; color: #1a2029; font: 12px/1.45 Inter, system-ui, sans-serif; }
.scenario-panel h2 { margin: 0 0 6px; font-size: 16px; }
.scenario-panel p { margin: 0 0 14px; color: #5b6573; }
.scenario-panel button { display: block; width: 100%; margin: 0 0 8px; padding: 9px 10px; border: 1px solid #cbd2dc; border-radius: 7px; background: #f7f9fb; color: #1a2029; text-align: left; cursor: pointer; }
.scenario-panel button:hover { border-color: #0f8f7e; }
.scenario-panel ul { margin: 14px 0 0; padding-left: 18px; color: #9b2c2c; }
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
