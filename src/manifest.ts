import { defineManifest } from "@crxjs/vite-plugin";

export default defineManifest({
  name: "CreMind GPT Free",
  description:
    "Unlocking the Potential of AI GPT Technology: Empowering Productivity with this Feature-Packed Extension",
  version: "2.7.0",
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
    default_popup: "popup.html",
  },
  options_page: "options.html",
  options_ui: {
    page: "options.html",
    open_in_tab: true,
  },
  background: {
    service_worker: "src/background/index.ts",
    type: "module",
  },
  content_scripts: [
    {
      matches: ["http://*/*", "https://*/*"],
      exclude_matches: ["https://chatgpt.com/*", "https://auth.openai.com/*"],
      js: ["src/content/index.ts"],
      run_at: "document_start",
    },
  ],
  web_accessible_resources: [
    {
      resources: ["img/*.png", "js/*", "background/*"],
      matches: ["http://*/*", "https://*/*"],
    },
  ],
  host_permissions: [
    "https://*.chatgpt.com/*",
    "https://*.openai.com/",
    "https://*.bing.com/",
    "wss://*.bing.com/*",
    "https://*.google.com/",
    "https://claude.ai/",
    "<all_urls>",
  ],
  permissions: [
    "storage",
    "contextMenus",
    "offscreen",
    "cookies",
    "declarativeNetRequestWithHostAccess",
  ],
  declarative_net_request: {
    rule_resources: [
      {
        id: "ruleset",
        enabled: true,
        path: "rules.json",
      },
    ],
  },
});
