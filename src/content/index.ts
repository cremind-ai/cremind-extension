import { createApp } from "vue";
import { createPinia } from "pinia";
import ElementPlus from "element-plus";
import App from "./App.vue";
import ElementIndexStyle from "element-plus/dist/index.css";
import CssVarsStyle from "element-plus/theme-chalk/dark/css-vars.css";
import CustomElementIndexStyle from "@/styles/element/index.scss";
import GithubDarkStyle from "@/styles/highlight.js/github-dark.css";
import GlobalIndexStyle from "@/styles/index.scss";
import IndexStyle from "./index.scss";

import BallonChatStyle from "@/styles/components/Chat/BallonChat.scss";
import ChatStyle from "@/styles/components/Chat/Chat.scss";
import ChatActionStyle from "@/styles/components/Chat/ChatAction.scss";
import RoomChatStyle from "@/styles/components/Chat/RoomChat.scss";

import UploadDialogStyle from "@/styles/components/UploadDialog.scss";
import UploadStyle from "@/styles/components/Upload.scss";
import ChatDialogStyle from "@/styles/components/ChatDialog.scss";
import ChatBoxStyle from "@/styles/components/ChatBox.scss";
import LoadImgStyle from "@/styles/components/LoadImg.scss";
import PopupMenuStyle from "@/styles/components/PopupMenu.scss";
import PromptCardSettingStyle from "@/styles/components/PromptCardSetting.scss";
import MenuBarStyle from "@/styles/components/MenuBar.scss";
import QuickFeatureCardStyle from "@/styles/components/QuickFeatureCard.scss";
import ManualMenuStyle from "@/styles/components/ManualMenu.scss";
import PromptAppStyle from "@/styles/components/PromptApp.scss";
import PromptAppDialogStyle from "@/styles/components/PromptAppDialog.scss";
import PromptCardFeatureStyle from "@/styles/components/PromptCardFeature.scss";

export let shadowRoot: ShadowRoot;

if (process.env.NODE_ENV === "production") {
  console.log = function () {};
}

function initExtension() {
  const shadowHost = document.createElement("cremind-app-extension");
  document.body.appendChild(shadowHost);
  shadowRoot = shadowHost.attachShadow({ mode: "open" });

  const appContainer = document.createElement("cremind-app-extension");
  appContainer.id = "cremind-app-extension";
  shadowRoot.appendChild(appContainer);

  const style = document.createElement("style");
  style.appendChild(document.createTextNode(ElementIndexStyle));
  style.appendChild(document.createTextNode(CssVarsStyle));
  style.appendChild(document.createTextNode(CustomElementIndexStyle));
  style.appendChild(document.createTextNode(GithubDarkStyle));
  style.appendChild(document.createTextNode(GlobalIndexStyle));
  style.appendChild(document.createTextNode(IndexStyle));
  style.appendChild(document.createTextNode(BallonChatStyle));
  style.appendChild(document.createTextNode(ChatStyle));
  style.appendChild(document.createTextNode(ChatActionStyle));
  style.appendChild(document.createTextNode(RoomChatStyle));
  style.appendChild(document.createTextNode(UploadDialogStyle));
  style.appendChild(document.createTextNode(UploadStyle));
  style.appendChild(document.createTextNode(ChatDialogStyle));
  style.appendChild(document.createTextNode(ChatBoxStyle));
  style.appendChild(document.createTextNode(LoadImgStyle));
  style.appendChild(document.createTextNode(PopupMenuStyle));
  style.appendChild(document.createTextNode(PromptCardSettingStyle));
  style.appendChild(document.createTextNode(MenuBarStyle));
  style.appendChild(document.createTextNode(QuickFeatureCardStyle));
  style.appendChild(document.createTextNode(ManualMenuStyle));
  style.appendChild(document.createTextNode(PromptAppStyle));
  style.appendChild(document.createTextNode(PromptAppDialogStyle));
  style.appendChild(document.createTextNode(PromptCardFeatureStyle));
  shadowRoot.appendChild(style);

  const app = createApp(App).use(createPinia());
  app.use(ElementPlus, { zIndex: 2147483647 });
  app.mount(appContainer);
}

const el = document.querySelector("body");
if (el) {
  initExtension();
} else {
  document.addEventListener("DOMContentLoaded", function () {
    initExtension();
  });
}
