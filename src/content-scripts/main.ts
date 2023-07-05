import { createApp } from "vue";
import { createPinia } from "pinia";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import App from "./App.vue";

window.onload = async () => {
  const el = document.querySelector("body");
  if (el) {
    el.insertAdjacentHTML("afterend", '<div id="app"></div>');
    const app = createApp(App).use(createPinia());
    app.use(ElementPlus);
    app.mount("#app");
  }
};
