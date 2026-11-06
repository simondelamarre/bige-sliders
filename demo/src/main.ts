import { createApp } from "vue";
import App from "./App.vue";
import { setupDemoCatalog } from "./catalog";

// Le catalogue se règle avant le montage : l’éditeur et l’API agent le lisent dès le départ.
setupDemoCatalog();
createApp(App).mount("#app");
