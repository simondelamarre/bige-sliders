#!/usr/bin/env node

import { randomUUID } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const [command, filePath, ...argumentsRest] = process.argv.slice(2);

function usage() {
  console.error("Usage:");
  console.error("  node bige-slides.mjs create <deck.bige-slides> <titre>");
  console.error("  node bige-slides.mjs inspect <deck.bige-slides>");
  console.error("  node bige-slides.mjs validate <deck.bige-slides>");
}

function id(prefix) {
  return `${prefix}-${randomUUID()}`;
}

function createDocument(title) {
  const slideId = id("slide");
  return {
    schemaVersion: 1,
    id: id("deck"),
    title,
    width: 1600,
    height: 900,
    theme: {
      id: "bige-dark",
      name: "Menthe",
      fontFamily: "Inter",
      headingFont: "Inter",
      colors: {
        background: "#0b1016",
        surface: "#151d27",
        text: "#f6f8fb",
        muted: "#9caabd",
        accent: "#5ee0c2",
        accentSoft: "#1d4b40"
      },
      typography: {
        display: { fontSize: 84, fontWeight: "bold", lineHeight: 0.98 },
        title: { fontSize: 66, fontWeight: "bold", lineHeight: 1.02 },
        heading: { fontSize: 40, fontWeight: "bold", lineHeight: 1.1 },
        subtitle: { fontSize: 26, fontWeight: "normal", lineHeight: 1.28 },
        eyebrow: { fontSize: 18, fontWeight: "bold", lineHeight: 1.1 },
        body: { fontSize: 29, fontWeight: "normal", lineHeight: 1.24 },
        quote: { fontSize: 50, fontWeight: "bold", lineHeight: 1.18 },
        kpi: { fontSize: 62, fontWeight: "bold", lineHeight: 1 },
        caption: { fontSize: 18, fontWeight: "normal", lineHeight: 1.12 }
      },
      chartPaletteId: "pitch-harmony"
    },
    dressings: [
      {
        id: "standard",
        name: "Standard",
        groups: [],
        elements: [
          {
            id: id("page"),
            name: "Numéro de page",
            type: "text",
            text: "{page}",
            x: 1296,
            y: 832,
            width: 240,
            height: 28,
            fontSize: 16,
            fontWeight: "bold",
            align: "right",
            color: "muted",
            textStyle: "custom",
            source: "assistant",
            plane: "front"
          }
        ]
      }
    ],
    defaultDressing: "standard",
    assets: {},
    slides: [
      {
        id: slideId,
        name: title,
        layout: "cover",
        background: "background",
        dressing: "standard",
        groups: [{ id: `${slideId}-content`, name: "Contenu" }],
        elements: [
          {
            id: id("eyebrow"),
            name: "Contexte",
            type: "text",
            text: "PRÉSENTATION",
            x: 100,
            y: 110,
            width: 900,
            height: 40,
            fontSize: 18,
            fontWeight: "bold",
            align: "left",
            color: "accent",
            lineHeight: 1.1,
            textStyle: "eyebrow",
            source: "assistant",
            groupId: `${slideId}-content`
          },
          {
            id: id("title"),
            name: "Titre",
            type: "text",
            text: title,
            x: 100,
            y: 220,
            width: 1180,
            height: 230,
            fontSize: 84,
            fontWeight: "bold",
            align: "left",
            color: "text",
            lineHeight: 0.98,
            textStyle: "display",
            source: "assistant",
            groupId: `${slideId}-content`
          },
          {
            id: id("subtitle"),
            name: "Sous-titre",
            type: "text",
            text: "Ajoute ici la promesse principale du deck.",
            x: 106,
            y: 540,
            width: 1050,
            height: 120,
            fontSize: 26,
            fontWeight: "normal",
            align: "left",
            color: "muted",
            lineHeight: 1.28,
            textStyle: "subtitle",
            source: "assistant",
            groupId: `${slideId}-content`
          },
          {
            id: id("accent"),
            name: "Accent",
            type: "shape",
            shape: "rect",
            x: 1320,
            y: 0,
            width: 280,
            height: 900,
            fill: "accent",
            source: "assistant"
          }
        ]
      }
    ]
  };
}

function object(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function validateDocument(document, sourcePath) {
  const errors = [];
  const warnings = [];
  const requireValue = (condition, message) => {
    if (!condition) errors.push(message);
  };

  requireValue(object(document), "La racine doit être un objet JSON.");
  if (!object(document)) return { errors, warnings };
  requireValue(document.schemaVersion === 1, "schemaVersion doit valoir 1.");
  requireValue(typeof document.id === "string" && document.id.length > 0, "id du deck manquant.");
  requireValue(typeof document.title === "string" && document.title.length > 0, "title du deck manquant.");
  requireValue(document.width === 1600 && document.height === 900, "Le canevas doit mesurer 1600 × 900.");
  requireValue(object(document.theme), "theme manquant ou invalide.");
  requireValue(object(document.assets), "assets doit être un objet, même vide.");
  requireValue(Array.isArray(document.slides), "slides doit être un tableau.");
  if (path.extname(sourcePath) !== ".bige-slides") warnings.push("Extension attendue : .bige-slides.");

  const themeTokens = ["background", "surface", "text", "muted", "accent", "accentSoft"];
  if (object(document.theme)) {
    requireValue(typeof document.theme.fontFamily === "string", "theme.fontFamily manquant.");
    requireValue(object(document.theme.colors), "theme.colors manquant.");
    for (const token of themeTokens) {
      requireValue(typeof document.theme.colors?.[token] === "string", `theme.colors.${token} manquant.`);
    }
  }

  const assets = object(document.assets) ? document.assets : {};
  const assetIds = new Set(Object.keys(assets));
  for (const [key, asset] of Object.entries(assets)) {
    requireValue(object(asset), `Asset ${key} invalide.`);
    if (!object(asset)) continue;
    requireValue(asset.id === key, `Asset ${key} : asset.id doit être identique à sa clé.`);
    requireValue(["image", "svg", "icon"].includes(asset.kind), `Asset ${key} : kind invalide.`);
    requireValue(typeof asset.src === "string", `Asset ${key} : src manquant.`);
    if (asset.key && /^(?:app|blob):/i.test(asset.src || "")) warnings.push(`Asset ${key} : URL temporaire à éviter.`);
  }

  const elementIds = new Set();
  const supportedTypes = new Set(["text", "shape", "path", "image", "icon", "chart", "table"]);
  const inspectContainer = (container, label) => {
    const groups = new Set(Array.isArray(container.groups) ? container.groups.map((group) => group?.id) : []);
    requireValue(Array.isArray(container.elements), `${label} : elements doit être un tableau.`);
    if (!Array.isArray(container.elements)) return;
    for (const [index, element] of container.elements.entries()) {
      const prefix = `${label}, élément ${index + 1}`;
      requireValue(object(element), `${prefix} invalide.`);
      if (!object(element)) continue;
      requireValue(typeof element.id === "string" && element.id.length > 0, `${prefix} : id manquant.`);
      if (elementIds.has(element.id)) errors.push(`${prefix} : id dupliqué ${element.id}.`);
      else elementIds.add(element.id);
      requireValue(typeof element.name === "string", `${prefix} : name manquant.`);
      requireValue(supportedTypes.has(element.type), `${prefix} : type ${String(element.type)} invalide.`);
      requireValue(["manual", "markdown", "bp", "assistant"].includes(element.source), `${prefix} : source invalide.`);
      for (const field of ["x", "y", "width", "height"]) {
        requireValue(Number.isFinite(element[field]), `${prefix} : ${field} doit être un nombre.`);
      }
      if (Number.isFinite(element.width) && element.width <= 0) errors.push(`${prefix} : width doit être positif.`);
      if (Number.isFinite(element.height) && element.height <= 0) errors.push(`${prefix} : height doit être positif.`);
      if (Number.isFinite(element.x) && Number.isFinite(element.width) && (element.x < 0 || element.x + element.width > 1600)) {
        warnings.push(`${prefix} : déborde horizontalement du canevas.`);
      }
      if (Number.isFinite(element.y) && Number.isFinite(element.height) && (element.y < 0 || element.y + element.height > 900)) {
        warnings.push(`${prefix} : déborde verticalement du canevas.`);
      }
      if (element.groupId && !groups.has(element.groupId)) errors.push(`${prefix} : groupId ${element.groupId} introuvable.`);
      if (element.type === "text") requireValue(typeof element.text === "string", `${prefix} : text manquant.`);
      if (element.type === "shape") requireValue(typeof element.shape === "string" && typeof element.fill === "string", `${prefix} : shape/fill manquant.`);
      if (element.type === "image" || element.type === "icon") {
        requireValue(assetIds.has(element.assetId), `${prefix} : assetId ${String(element.assetId)} introuvable.`);
      }
      if (element.type === "chart") {
        requireValue(Array.isArray(element.categories) && Array.isArray(element.series), `${prefix} : categories/series invalides.`);
      }
      if (element.type === "table") {
        requireValue(Array.isArray(element.rows) && Array.isArray(element.columnWidths), `${prefix} : rows/columnWidths invalides.`);
      }
    }
  };

  const dressingIds = new Set();
  if (document.dressings !== undefined) {
    requireValue(Array.isArray(document.dressings), "dressings doit être un tableau.");
    if (Array.isArray(document.dressings)) {
      for (const [index, dressing] of document.dressings.entries()) {
        requireValue(object(dressing) && typeof dressing.id === "string", `Habillage ${index + 1} invalide.`);
        if (!object(dressing)) continue;
        if (dressingIds.has(dressing.id)) errors.push(`Habillage : id dupliqué ${dressing.id}.`);
        dressingIds.add(dressing.id);
        inspectContainer(dressing, `Habillage ${dressing.id || index + 1}`);
      }
    }
  }
  if (document.defaultDressing !== undefined && !dressingIds.has(document.defaultDressing)) {
    errors.push(`defaultDressing ${document.defaultDressing} introuvable.`);
  }

  const slideIds = new Set();
  if (Array.isArray(document.slides)) {
    for (const [index, slide] of document.slides.entries()) {
      const label = `Slide ${index + 1}`;
      requireValue(object(slide), `${label} invalide.`);
      if (!object(slide)) continue;
      requireValue(typeof slide.id === "string" && slide.id.length > 0, `${label} : id manquant.`);
      if (slideIds.has(slide.id)) errors.push(`${label} : id dupliqué ${slide.id}.`);
      slideIds.add(slide.id);
      requireValue(typeof slide.name === "string", `${label} : name manquant.`);
      requireValue(typeof slide.background === "string", `${label} : background manquant.`);
      if (slide.dressing !== undefined && slide.dressing !== null && !dressingIds.has(slide.dressing)) {
        errors.push(`${label} : dressing ${slide.dressing} introuvable.`);
      }
      inspectContainer(slide, `${label} (${slide.name || "sans nom"})`);
    }
  }

  return { errors, warnings };
}

async function loadDocument(sourcePath) {
  try {
    return JSON.parse(await readFile(sourcePath, "utf8"));
  } catch (error) {
    throw new Error(`Lecture JSON impossible : ${error.message}`);
  }
}

async function main() {
  if (!command || !filePath || !["create", "inspect", "validate"].includes(command)) {
    usage();
    process.exitCode = 2;
    return;
  }

  const resolvedPath = path.resolve(filePath);
  if (command === "create") {
    const title = argumentsRest.join(" ").trim();
    if (!title) throw new Error("Le titre du deck est requis.");
    if (path.extname(resolvedPath) !== ".bige-slides") throw new Error("Le fichier doit se terminer par .bige-slides.");
    await writeFile(resolvedPath, `${JSON.stringify(createDocument(title), null, 2)}\n`, { encoding: "utf8", flag: "wx" });
    console.log(`Créé : ${resolvedPath}`);
    return;
  }

  const document = await loadDocument(resolvedPath);
  const { errors, warnings } = validateDocument(document, resolvedPath);
  if (command === "inspect") {
    const slides = Array.isArray(document.slides) ? document.slides : [];
    console.log(JSON.stringify({
      file: resolvedPath,
      title: document.title,
      schemaVersion: document.schemaVersion,
      size: `${document.width}×${document.height}`,
      theme: document.theme?.name || document.theme?.id || "sans nom",
      slides: slides.map((slide, index) => ({
        position: index + 1,
        id: slide?.id,
        name: slide?.name,
        hidden: Boolean(slide?.hidden),
        elements: Array.isArray(slide?.elements) ? slide.elements.length : 0
      })),
      assets: object(document.assets) ? Object.keys(document.assets).length : 0,
      errors: errors.length,
      warnings: warnings.length
    }, null, 2));
    return;
  }

  for (const warning of warnings) console.warn(`AVERTISSEMENT : ${warning}`);
  for (const error of errors) console.error(`ERREUR : ${error}`);
  if (errors.length) {
    console.error(`${errors.length} erreur(s), ${warnings.length} avertissement(s).`);
    process.exitCode = 1;
    return;
  }
  console.log(`Valide : ${resolvedPath} (${warnings.length} avertissement(s)).`);
}

main().catch((error) => {
  console.error(`ERREUR : ${error.message}`);
  process.exitCode = 1;
});
