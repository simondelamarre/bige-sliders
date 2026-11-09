import type { PresentationImageItem, PresentationImageLibrary, PresentationImageSource } from "bige-sliders";

/**
 * Bibliothèque d’images factice : des visuels générés, aucune requête réseau.
 * Dans ton app, `createHttpImageSource({ id, label, url })` la remplace.
 */
type DemoImage = PresentationImageItem & { src: string; kind: string };

const THEMES = [
  { kind: "aurore", label: "Aurore", from: "#4f46e5", to: "#34d399" },
  { kind: "desert", label: "Désert", from: "#f59e0b", to: "#b91c1c" },
  { kind: "foret", label: "Forêt", from: "#14532d", to: "#a3e635" },
];

function picture(from: string, to: string, angle: number) {
  const body = `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900"><defs><linearGradient id="g" gradientTransform="rotate(${angle} .5 .5)"><stop stop-color="${from}"/><stop offset="1" stop-color="${to}"/></linearGradient></defs><rect width="1600" height="900" fill="url(#g)"/><circle cx="1180" cy="300" r="170" fill="#fff" fill-opacity=".16"/></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(body)}`;
}

const catalog: DemoImage[] = Array.from({ length: 48 }, (_, index) => {
  const theme = THEMES[index % THEMES.length];
  const src = picture(theme.from, theme.to, (index * 25) % 360);
  return { id: `demo-${index + 1}`, name: `${theme.label} ${Math.floor(index / THEMES.length) + 1}`, thumbnailUrl: src, src, kind: theme.kind, width: 1600, height: 900, credit: "Banque de démo" };
});

const saved: DemoImage[] = [];

const source: PresentationImageSource = {
  id: "banque",
  label: "Banque d’images",
  filters: [{ id: "kind", label: "Ambiance", options: THEMES.map((theme) => ({ value: theme.kind, label: theme.label })) }],
  async search({ text, page, pageSize, filters }) {
    const needle = text.trim().toLowerCase();
    const found = [...saved, ...catalog].filter((image) => image.name.toLowerCase().includes(needle) && (!filters.kind || image.kind === filters.kind));
    const start = (page - 1) * pageSize;
    return { items: found.slice(start, start + pageSize), hasMore: start + pageSize < found.length };
  },
  async resolve(item) {
    const { src, width, height } = item as DemoImage;
    return { src, mimeType: "image/svg+xml", width, height };
  },
};

export const demoImageLibrary: PresentationImageLibrary = {
  sources: [source],
  // « Enregistrer dans la bibliothèque » : ici, en mémoire le temps de la visite.
  async save(asset) {
    const itemId = `saved-${asset.id}`;
    saved.unshift({ id: itemId, name: asset.name, thumbnailUrl: asset.src, src: asset.src, kind: "" });
    return { sourceId: source.id, itemId };
  },
};
