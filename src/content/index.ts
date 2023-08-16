import { createApp } from "vue";
import { createPinia } from "pinia";
import ElementPlus from "element-plus";
import App from "./App.vue";
import "element-plus/dist/index.css";
import "element-plus/theme-chalk/dark/css-vars.css";
import "@/styles/element/index.scss";
import "@/styles/highlight.js/github-dark.css";
import "./index.scss";

const el = document.querySelector("body");
if (el) {
  el.insertAdjacentHTML(
    "beforeend",
    '<cremind-app-extension id="cremind-app-extension"></cremind-app-extension>'
  );
  const app = createApp(App).use(createPinia());
  app.use(ElementPlus);
  app.mount("#cremind-app-extension");
}
