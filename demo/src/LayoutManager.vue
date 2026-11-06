<script setup lang="ts">
import { computed, ref } from "vue";
import {
  presentationLayoutSetup,
  removeLayoutTemplate,
  saveLayoutTemplate,
  savedPresentationLayouts,
  type PresentationDocument,
  type PresentationHost,
  type PresentationLayoutTemplate,
} from "bige-sliders";
import { PresentationSlideEditor, PresentationSlideThumbnail } from "bige-sliders/vue";
import { storeLayouts } from "./catalog";

/**
 * Gestion des favoris hors de l’éditeur complet : vignettes rangées par onglet
 * (`PresentationSlideThumbnail`), édition d’un favori seul
 * (`PresentationSlideEditor`), suppression. Chaque changement repart au
 * catalogue et au stockage de l’app.
 */
const props = defineProps<{ document: PresentationDocument; host: PresentationHost }>();

const templates = ref<PresentationLayoutTemplate[]>(savedPresentationLayouts());
const selectedId = ref<string | null>(templates.value[0]?.id ?? null);
const selected = computed(() => templates.value.find((template) => template.id === selectedId.value) ?? null);

/** Onglets qui contiennent des favoris, dans l’ordre de la galerie. */
const groups = computed(() => {
  const byId = new Map(templates.value.map((template) => [template.id, template]));
  return presentationLayoutSetup().tabs
    .map((tab) => ({ label: tab.label, items: tab.layouts.map((id) => byId.get(id)).filter((item): item is PresentationLayoutTemplate => !!item) }))
    .filter((tab) => tab.items.length);
});

function refresh() {
  templates.value = savedPresentationLayouts();
}

function update(template: PresentationLayoutTemplate) {
  storeLayouts(saveLayoutTemplate(template, template.category).layouts);
  refresh();
}

function remove(id: string) {
  storeLayouts(removeLayoutTemplate(id));
  refresh();
  if (selectedId.value === id) selectedId.value = templates.value[0]?.id ?? null;
}
</script>

<template>
  <div class="manager">
    <aside class="list" aria-label="Mes layouts">
      <p v-if="!groups.length" class="empty">Aucun favori pour l’instant. Dans le deck : <b>⋯</b> sur une slide → « Enregistrer comme layout ».</p>
      <section v-for="group in groups" :key="group.label">
        <h2>{{ group.label }}</h2>
        <ul>
          <li v-for="template in group.items" :key="template.id" :class="template.id === selectedId ? 'is-active' : ''">
            <button type="button" class="pick" @click="selectedId = template.id">
              <PresentationSlideThumbnail :template="template" :document="props.document" />
              <span>{{ template.name }}</span>
            </button>
            <button type="button" class="remove" :aria-label="`Supprimer ${template.name}`" title="Supprimer ce favori" @click="remove(template.id)">×</button>
          </li>
        </ul>
      </section>
    </aside>
    <section class="stage">
      <PresentationSlideEditor v-if="selected" :model-value="selected" :document="props.document" :host="props.host" appearance="light" @update:model-value="update" />
      <p v-else class="empty">Choisis un favori à gauche pour le modifier ici, sans le reste du deck.</p>
    </section>
  </div>
</template>

<style scoped>
.manager { display: grid; grid-template-columns: 260px 1fr; height: 100%; min-height: 0; background: #f4f6f8; }
.list { overflow-y: auto; padding: 14px; border-right: 1px solid #dde1e7; background: #ffffff; }
.list h2 { margin: 12px 0 8px; font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: #5b6573; }
.list ul { display: grid; gap: 10px; margin: 0; padding: 0; list-style: none; }
.list li { position: relative; }
.pick { display: grid; gap: 6px; width: 100%; padding: 6px; border: 1px solid #dde1e7; border-radius: 8px; background: #ffffff; text-align: left; font: 12px Inter, system-ui, sans-serif; color: #1f2733; cursor: pointer; }
.list li.is-active .pick { border-color: #0f8f7e; box-shadow: 0 0 0 2px rgb(15 143 126 / 0.18); }
.remove { position: absolute; top: 10px; right: 10px; width: 22px; height: 22px; border: 0; border-radius: 6px; background: rgb(14 17 22 / 0.7); color: #ffffff; cursor: pointer; }
.stage { min-width: 0; min-height: 0; }
.empty { margin: 24px; color: #5b6573; font: 13px/1.5 Inter, system-ui, sans-serif; }
</style>
