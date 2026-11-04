/**
 * Exemple « Compatible agents » : ce qu’un agent (LLM) fait avec bige-sliders,
 * sans Vue ni navigateur. Les opérations sont écrites en dur ici ; dans ton
 * app, elles viennent du modèle, qui a reçu `summarizeDeck` et `describeSlide`
 * dans son contexte, et les refus lui sont renvoyés pour qu’il corrige.
 */
import {
  applyDeckOperations,
  checkSlideLayout,
  describeSlide,
  editSlideElements,
  type PresentationDocument,
  type SlideElementOperation,
} from "bige-sliders";

export function runAgentExample(deck: PresentationDocument) {
  // 1. Le deck : une slide « Message clé » ajoutée à la fin, ses textes remplis.
  const created = applyDeckOperations(deck, [{
    op: "create_slide",
    layout: "statement", // sans `position` (1 = première), la slide va à la fin
    slots: { Titre: "Ajoutée par l’API agent", Message: "Ce texte, ce cadre et cette pastille viennent d’opérations JSON." },
  }]);
  const { slideId, position } = created.changes[0];

  // 2. Le contexte que le modèle lirait avant de proposer ses opérations.
  const context = describeSlide(created.document, slideId);

  // 3. Les opérations du modèle : deux valides, une hors de la slide (refusée et expliquée).
  const operations: SlideElementOperation[] = [
    { op: "add_shape", shape: "roundedRect", x: 1180, y: 96, width: 320, height: 200, fill: "accent", fill_opacity: 0.25, stroke: "accent" },
    { op: "add_text", text: "JSON", style: "title", x: 1220, y: 150, width: 240, height: 90 },
    { op: "add_shape", shape: "ellipse", x: 2000, y: 0, width: 10, height: 10 },
  ];
  const result = editSlideElements(created.document, slideId, operations, {});

  // 4. Le contrôle de mise en page, à renvoyer au modèle avec les refus.
  const checks = checkSlideLayout(result.document, slideId);

  return {
    document: result.document,
    position,
    contextElements: context.elements.length,
    applied: result.applied,
    rejected: result.rejected,
    checks,
  };
}
