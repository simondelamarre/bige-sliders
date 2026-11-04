import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// GitHub Pages sert la démo sous /bige-sliders/ ; StackBlitz et `npm run dev` à la racine.
export default defineConfig({ base: process.env.DEMO_BASE || "/", plugins: [vue()] });
