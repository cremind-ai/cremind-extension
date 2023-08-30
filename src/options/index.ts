import { createApp } from "vue";
import { createPinia } from "pinia";
import ElementPlus from "element-plus";
import App from "./App.vue";
import router from "./router";
import "element-plus/dist/index.css";
import "element-plus/theme-chalk/dark/css-vars.css";
import "@/styles/index.scss";

const app = createApp(App).use(createPinia());
app.use(router);
app.use(ElementPlus);
app.mount("#app");
