import { createApp } from "vue";
import { createPinia } from "pinia";
import ElementPlus from "element-plus";
import App from "./App.vue";
import "element-plus/dist/index.css";
import "../styles/element/index.scss";
import "../styles/highlight.js/github-dark.css";
import "./index.scss";

const el = document.querySelector("body");
if (el) {
  el.insertAdjacentHTML("beforeend", '<div id="cword-app-extension"></div>');
  const app = createApp(App).use(createPinia());
  app.use(ElementPlus);
  app.mount("#cword-app-extension");
}
