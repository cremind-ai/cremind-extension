import { defineManifest } from "@crxjs/vite-plugin";

export default defineManifest({
  name: "CreMind GPT Extension",
  description:
    "Unlocking the Potential of AI GPT Technology: Empowering Productivity with this Feature-Packed Extension",
  version: "2.0.1",
  manifest_version: 3,
  icons: {
    "16": "img/CreMind-logo-16.png",
    "48": "img/CreMind-logo-48.png",
    "128": "img/CreMind-logo-128.png",
  },
  action: {
    default_icon: {
      "16": "img/CreMind-logo-16.png",
      "48": "img/CreMind-logo-48.png",
      "128": "img/CreMind-logo-128.png",
    },
    default_title: "CreMind Popup Page",
    // default_popup: "popup.html",
  },
  options_page: "options.html",
  background: {
    service_worker: "src/background/index.ts",
    type: "module",
  },
  content_scripts: [
    {
      matches: ["http://*/*", "https://*/*"],
      js: ["src/content/index.ts"],
    },
  ],
  web_accessible_resources: [
    {
      resources: ["img/*.png"],
      matches: ["http://*/*", "https://*/*"],
    },
  ],
  permissions: ["storage", "contextMenus"],
});
