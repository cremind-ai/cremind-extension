import { createApp } from "vue";
import { createPinia } from "pinia";
import ElementPlus from "element-plus";
import App from "./App.vue";
import "element-plus/dist/index.css";

const el = document.querySelector("body");
if (el) {
  el.insertAdjacentHTML("beforeend", '<div id="cremind-app-extension"></div>');
  const app = createApp(App).use(createPinia());
  app.use(ElementPlus);
  app.mount("#cremind-app-extension");
}