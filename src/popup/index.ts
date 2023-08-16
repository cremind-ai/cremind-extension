import { createApp } from "vue";
import { createPinia } from "pinia";
import ElementPlus from "element-plus";
import App from "./App.vue";
import "element-plus/dist/index.css";
import "element-plus/theme-chalk/dark/css-vars.css";

const app = createApp(App).use(createPinia());
app.use(ElementPlus);
app.mount("#app");
