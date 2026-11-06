import {
  baseSlide,
  configurePresentationCatalog,
  definePresentationTheme,
  layoutText,
  type PresentationBookmark,
  type PresentationLayoutDefinition,
  type PresentationThemeSave,
  type PresentationThemePreset,
} from "bige-sliders";

/**
 * Catalogue de la démo, réglé avant de monter l’éditeur : un layout et un thème
 * maison (avec son habillage), des onglets réorganisés. La galerie, les nouveaux
 * decks et l’API agent suivent ce réglage.
 */
const highlight: PresentationLayoutDefinition = {
  id: "demo-highlight",
  name: "Mettre un chiffre en avant",
  label: "Chiffre phare",
  description: "Un grand chiffre, son titre et son contexte",
  category: "Démo",
  use: "Un seul résultat chiffré qui porte le message de la slide.",
  sample: { title: "Des decks prêts en 10 minutes", body: "Mesuré sur les équipes qui partent des layouts de leur app." },
  build: (index, content) => baseSlide(`slide-${index}`, content.title, "demo-highlight", [
    { id: `s${index}-band`, name: "Bandeau", type: "shape", shape: "rect", x: 0, y: 0, width: 560, height: 900, fill: "accentSoft", source: "manual" },
    layoutText(`s${index}-figure`, "Chiffre", "87 %", 80, 330, 420, 200, 84, { textStyle: "kpi", color: "accent", align: "center" }),
    layoutText(`s${index}-title`, "Titre", content.title, 640, 250, 860, 200, 64, { textStyle: "title" }),
    layoutText(`s${index}-body`, "Contexte", content.body, 644, 480, 820, 200, 30, { textStyle: "body", color: "muted" }),
  ]),
};

const braise = definePresentationTheme({
  id: "demo-braise",
  name: "Braise",
  tone: "dark",
  description: "Thème maison de la démo",
  colors: { background: "#14100f", surface: "#221a18", text: "#fbf4f1", muted: "#b9a7a1", accent: "#ff7a45", accentSoft: "#4a2418" },
  // Habillage : un calque d’objets posé sur les slides, variables remplies slide par slide.
  dressings: [
    {
      id: "standard",
      name: "Standard",
      elements: [
        { id: "rule", name: "Filet", type: "shape", shape: "rect", x: 64, y: 820, width: 1472, height: 2, fill: "accentSoft", source: "manual", plane: "back" },
        { id: "deck", name: "Titre du deck", type: "text", text: "{deck}", x: 64, y: 836, width: 900, height: 30, fontSize: 16, color: "muted", source: "manual" },
        { id: "page", name: "Numéro de page", type: "text", text: "{page} / {total}", x: 1336, y: 836, width: 200, height: 30, fontSize: 16, fontWeight: "bold", align: "right", color: "accent", source: "manual" },
      ],
    },
  ],
});

/**
 * Favoris et thèmes personnels : l’éditeur les émet (`@bookmark`,
 * `@theme-save`), l’app les garde où elle veut (ici `localStorage`) et les
 * renvoie au catalogue au chargement suivant.
 */
const SAVED_KEY = "bige-sliders-demo.saved";
type Saved = { layouts?: PresentationBookmark["layouts"]; themes?: PresentationThemePreset[] };

function readSaved(): Saved {
  try {
    return JSON.parse(localStorage.getItem(SAVED_KEY) || "{}") as Saved;
  } catch {
    return {};
  }
}

function writeSaved(patch: Saved) {
  localStorage.setItem(SAVED_KEY, JSON.stringify({ ...readSaved(), ...patch }));
}

/** `@bookmark` : le réglage `layouts` complet, à renvoyer tel quel. */
export function storeBookmark(bookmark: PresentationBookmark) {
  writeSaved({ layouts: bookmark.layouts });
}

/** `@theme-save` : la liste des thèmes personnels après le changement. */
export function storeThemes(event: PresentationThemeSave) {
  writeSaved({ themes: event.themes });
}

export function forgetSaved() {
  localStorage.removeItem(SAVED_KEY);
}

const DEMO_TABS = [
  // `statement` sert à l’exemple d’API agent : un layout hors onglets lui serait refusé.
  { label: "Démo", layouts: ["demo-highlight", "cover", "statement"] },
  { label: "Récit", layouts: ["problem", "solution", "quote", "timeline"] },
  { label: "Chiffres", layouts: ["metric-grid", "chart", "data-table", "traction"] },
  { label: "Décider", layouts: ["comparison", "pricing"] },
];

export function setupDemoCatalog() {
  const saved = readSaved();
  const themes = saved.themes ?? [];
  configurePresentationCatalog({
    layouts: {
      definitions: [highlight],
      // Les favoris reviennent avec leurs onglets ; sans favori, ceux de la démo.
      templates: saved.layouts?.templates,
      tabs: saved.layouts?.tabs ?? DEMO_TABS,
    },
    themes: {
      definitions: [braise, ...themes],
      list: ["demo-braise", "bige-dark", "capital", ...themes.map((theme) => theme.id)],
      default: "demo-braise",
    },
  });
}
