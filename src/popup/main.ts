import { createApp } from "vue";
import { createPinia } from "pinia";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import "../styles/element/index.scss";
import App from "./Popup.vue";

window.onload = async () => {
  const el = document.querySelector("body");
  if (el) {
    el.insertAdjacentHTML("afterend", '<div id="cword-app-extension"></div>');
    const app = createApp(App).use(createPinia());
    app.use(ElementPlus);
    app.mount("#cword-app-extension");
  }
};
