// vite.config.ts
import { defineConfig, loadEnv } from "vite";
import { crx } from "@crxjs/vite-plugin";
import vue from "@vitejs/plugin-vue";
import zipPack from "vite-plugin-zip-pack";

// src/manifest.ts
import { defineManifest } from "@crxjs/vite-plugin";
var manifest_default = defineManifest({
  name: "CreMind GPT Extension",
  description: "Unlocking the Potential of AI GPT Technology: Empowering Productivity with this Feature-Packed Extension",
  version: "2.2.1",
  manifest_version: 3,
  icons: {
    "16": "img/CreMind-logo-16.png",
    "48": "img/CreMind-logo-48.png",
    "128": "img/CreMind-logo-128.png"
  },
  action: {
    default_icon: {
      "16": "img/CreMind-logo-16.png",
      "48": "img/CreMind-logo-48.png",
      "128": "img/CreMind-logo-128.png"
    },
    default_title: "CreMind Popup Page"
  },
  options_page: "options.html",
  options_ui: {
    page: "options.html",
    open_in_tab: true
  },
  background: {
    service_worker: "src/background/index.ts",
    type: "module"
  },
  content_scripts: [
    {
      matches: ["http://*/*", "https://*/*"],
      js: ["src/content/index.ts"],
      run_at: "document_start"
    }
  ],
  web_accessible_resources: [
    {
      resources: ["img/*.png"],
      matches: ["http://*/*", "https://*/*"]
    }
  ],
  host_permissions: ["<all_urls>"],
  permissions: ["storage", "contextMenus"]
});

// vite.config.ts
import { resolve } from "path";
var root = process.cwd();
function pathResolve(dir) {
  return resolve(root, ".", dir);
}
var vite_config_default = defineConfig(({ command, mode }) => {
  let env = {};
  env = loadEnv(mode, root);
  console.log(env);
  return {
    resolve: {
      extensions: [
        ".mjs",
        ".js",
        ".ts",
        ".jsx",
        ".tsx",
        ".json",
        ".less",
        ".css"
      ],
      alias: [
        {
          find: /\@\//,
          replacement: `${pathResolve("src")}/`
        }
      ]
    },
    build: {
      emptyOutDir: true,
      outDir: "build",
      rollupOptions: {
        plugins: [],
        output: {
          chunkFileNames: "assets/chunk-[hash].js"
        }
      }
    },
    plugins: [
      crx({ manifest: manifest_default }),
      vue(),
      zipPack({
        outDir: `package`,
        inDir: "build",
        outFileName: `${manifest_default.short_name ?? manifest_default.name.replaceAll(" ", "-")}-extension-v${manifest_default.version}.zip`
      })
    ],
    server: {
      port: parseInt(env.VITE_PORT),
      hmr: {
        protocol: "ws",
        port: 8080
      },
      host: "0.0.0.0"
    }
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiLCAic3JjL21hbmlmZXN0LnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJpbXBvcnQgeyBkZWZpbmVDb25maWcsIGxvYWRFbnYgfSBmcm9tIFwidml0ZVwiO1xuaW1wb3J0IHsgY3J4IH0gZnJvbSBcIkBjcnhqcy92aXRlLXBsdWdpblwiO1xuaW1wb3J0IHZ1ZSBmcm9tIFwiQHZpdGVqcy9wbHVnaW4tdnVlXCI7XG5pbXBvcnQgemlwUGFjayBmcm9tIFwidml0ZS1wbHVnaW4temlwLXBhY2tcIjtcbmltcG9ydCBtYW5pZmVzdCBmcm9tIFwiLi9zcmMvbWFuaWZlc3RcIjtcbmltcG9ydCB7IHJlc29sdmUgfSBmcm9tIFwicGF0aFwiO1xuXG5jb25zdCByb290ID0gcHJvY2Vzcy5jd2QoKTtcblxuZnVuY3Rpb24gcGF0aFJlc29sdmUoZGlyOiBzdHJpbmcpIHtcbiAgcmV0dXJuIHJlc29sdmUocm9vdCwgXCIuXCIsIGRpcik7XG59XG5cbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoKHsgY29tbWFuZCwgbW9kZSB9KSA9PiB7XG4gIGxldCBlbnYgPSB7fSBhcyBhbnk7XG4gIGVudiA9IGxvYWRFbnYobW9kZSwgcm9vdCk7XG4gIGNvbnNvbGUubG9nKGVudik7XG5cbiAgcmV0dXJuIHtcbiAgICByZXNvbHZlOiB7XG4gICAgICBleHRlbnNpb25zOiBbXG4gICAgICAgIFwiLm1qc1wiLFxuICAgICAgICBcIi5qc1wiLFxuICAgICAgICBcIi50c1wiLFxuICAgICAgICBcIi5qc3hcIixcbiAgICAgICAgXCIudHN4XCIsXG4gICAgICAgIFwiLmpzb25cIixcbiAgICAgICAgXCIubGVzc1wiLFxuICAgICAgICBcIi5jc3NcIixcbiAgICAgIF0sXG4gICAgICBhbGlhczogW1xuICAgICAgICB7XG4gICAgICAgICAgZmluZDogL1xcQFxcLy8sXG4gICAgICAgICAgcmVwbGFjZW1lbnQ6IGAke3BhdGhSZXNvbHZlKFwic3JjXCIpfS9gLFxuICAgICAgICB9LFxuICAgICAgXSxcbiAgICB9LFxuICAgIGJ1aWxkOiB7XG4gICAgICBlbXB0eU91dERpcjogdHJ1ZSxcbiAgICAgIG91dERpcjogXCJidWlsZFwiLFxuICAgICAgcm9sbHVwT3B0aW9uczoge1xuICAgICAgICBwbHVnaW5zOiBbXSxcbiAgICAgICAgb3V0cHV0OiB7XG4gICAgICAgICAgY2h1bmtGaWxlTmFtZXM6IFwiYXNzZXRzL2NodW5rLVtoYXNoXS5qc1wiLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICB9LFxuICAgIHBsdWdpbnM6IFtcbiAgICAgIGNyeCh7IG1hbmlmZXN0IH0pLFxuICAgICAgdnVlKCksXG4gICAgICB6aXBQYWNrKHtcbiAgICAgICAgb3V0RGlyOiBgcGFja2FnZWAsXG4gICAgICAgIGluRGlyOiBcImJ1aWxkXCIsXG4gICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgb3V0RmlsZU5hbWU6IGAke1xuICAgICAgICAgIG1hbmlmZXN0LnNob3J0X25hbWUgPz8gbWFuaWZlc3QubmFtZS5yZXBsYWNlQWxsKFwiIFwiLCBcIi1cIilcbiAgICAgICAgfS1leHRlbnNpb24tdiR7bWFuaWZlc3QudmVyc2lvbn0uemlwYCxcbiAgICAgIH0pLFxuICAgIF0sXG4gICAgc2VydmVyOiB7XG4gICAgICBwb3J0OiBwYXJzZUludChlbnYuVklURV9QT1JUISksXG4gICAgICBobXI6IHtcbiAgICAgICAgcHJvdG9jb2w6IFwid3NcIixcbiAgICAgICAgcG9ydDogODA4MCxcbiAgICAgIH0sXG4gICAgICBob3N0OiBcIjAuMC4wLjBcIixcbiAgICB9LFxuICB9O1xufSk7XG4iLCAiaW1wb3J0IHsgZGVmaW5lTWFuaWZlc3QgfSBmcm9tIFwiQGNyeGpzL3ZpdGUtcGx1Z2luXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZU1hbmlmZXN0KHtcbiAgbmFtZTogXCJDcmVNaW5kIEdQVCBFeHRlbnNpb25cIixcbiAgZGVzY3JpcHRpb246XG4gICAgXCJVbmxvY2tpbmcgdGhlIFBvdGVudGlhbCBvZiBBSSBHUFQgVGVjaG5vbG9neTogRW1wb3dlcmluZyBQcm9kdWN0aXZpdHkgd2l0aCB0aGlzIEZlYXR1cmUtUGFja2VkIEV4dGVuc2lvblwiLFxuICB2ZXJzaW9uOiBcIjIuMi4xXCIsXG4gIG1hbmlmZXN0X3ZlcnNpb246IDMsXG4gIGljb25zOiB7XG4gICAgXCIxNlwiOiBcImltZy9DcmVNaW5kLWxvZ28tMTYucG5nXCIsXG4gICAgXCI0OFwiOiBcImltZy9DcmVNaW5kLWxvZ28tNDgucG5nXCIsXG4gICAgXCIxMjhcIjogXCJpbWcvQ3JlTWluZC1sb2dvLTEyOC5wbmdcIixcbiAgfSxcbiAgYWN0aW9uOiB7XG4gICAgZGVmYXVsdF9pY29uOiB7XG4gICAgICBcIjE2XCI6IFwiaW1nL0NyZU1pbmQtbG9nby0xNi5wbmdcIixcbiAgICAgIFwiNDhcIjogXCJpbWcvQ3JlTWluZC1sb2dvLTQ4LnBuZ1wiLFxuICAgICAgXCIxMjhcIjogXCJpbWcvQ3JlTWluZC1sb2dvLTEyOC5wbmdcIixcbiAgICB9LFxuICAgIGRlZmF1bHRfdGl0bGU6IFwiQ3JlTWluZCBQb3B1cCBQYWdlXCIsXG4gICAgLy8gZGVmYXVsdF9wb3B1cDogXCJwb3B1cC5odG1sXCIsXG4gIH0sXG4gIG9wdGlvbnNfcGFnZTogXCJvcHRpb25zLmh0bWxcIixcbiAgb3B0aW9uc191aToge1xuICAgIHBhZ2U6IFwib3B0aW9ucy5odG1sXCIsXG4gICAgb3Blbl9pbl90YWI6IHRydWUsXG4gIH0sXG4gIGJhY2tncm91bmQ6IHtcbiAgICBzZXJ2aWNlX3dvcmtlcjogXCJzcmMvYmFja2dyb3VuZC9pbmRleC50c1wiLFxuICAgIHR5cGU6IFwibW9kdWxlXCIsXG4gIH0sXG4gIGNvbnRlbnRfc2NyaXB0czogW1xuICAgIHtcbiAgICAgIG1hdGNoZXM6IFtcImh0dHA6Ly8qLypcIiwgXCJodHRwczovLyovKlwiXSxcbiAgICAgIGpzOiBbXCJzcmMvY29udGVudC9pbmRleC50c1wiXSxcbiAgICAgIHJ1bl9hdDogXCJkb2N1bWVudF9zdGFydFwiLFxuICAgIH0sXG4gIF0sXG4gIHdlYl9hY2Nlc3NpYmxlX3Jlc291cmNlczogW1xuICAgIHtcbiAgICAgIHJlc291cmNlczogW1wiaW1nLyoucG5nXCJdLFxuICAgICAgbWF0Y2hlczogW1wiaHR0cDovLyovKlwiLCBcImh0dHBzOi8vKi8qXCJdLFxuICAgIH0sXG4gIF0sXG4gIGhvc3RfcGVybWlzc2lvbnM6IFtcIjxhbGxfdXJscz5cIl0sXG4gIHBlcm1pc3Npb25zOiBbXCJzdG9yYWdlXCIsIFwiY29udGV4dE1lbnVzXCJdLFxufSk7XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQUEsU0FBUyxjQUFjLGVBQWU7QUFDdEMsU0FBUyxXQUFXO0FBQ3BCLE9BQU8sU0FBUztBQUNoQixPQUFPLGFBQWE7OztBQ0hwQixTQUFTLHNCQUFzQjtBQUUvQixJQUFPLG1CQUFRLGVBQWU7QUFBQSxFQUM1QixNQUFNO0FBQUEsRUFDTixhQUNFO0FBQUEsRUFDRixTQUFTO0FBQUEsRUFDVCxrQkFBa0I7QUFBQSxFQUNsQixPQUFPO0FBQUEsSUFDTCxNQUFNO0FBQUEsSUFDTixNQUFNO0FBQUEsSUFDTixPQUFPO0FBQUEsRUFDVDtBQUFBLEVBQ0EsUUFBUTtBQUFBLElBQ04sY0FBYztBQUFBLE1BQ1osTUFBTTtBQUFBLE1BQ04sTUFBTTtBQUFBLE1BQ04sT0FBTztBQUFBLElBQ1Q7QUFBQSxJQUNBLGVBQWU7QUFBQSxFQUVqQjtBQUFBLEVBQ0EsY0FBYztBQUFBLEVBQ2QsWUFBWTtBQUFBLElBQ1YsTUFBTTtBQUFBLElBQ04sYUFBYTtBQUFBLEVBQ2Y7QUFBQSxFQUNBLFlBQVk7QUFBQSxJQUNWLGdCQUFnQjtBQUFBLElBQ2hCLE1BQU07QUFBQSxFQUNSO0FBQUEsRUFDQSxpQkFBaUI7QUFBQSxJQUNmO0FBQUEsTUFDRSxTQUFTLENBQUMsY0FBYyxhQUFhO0FBQUEsTUFDckMsSUFBSSxDQUFDLHNCQUFzQjtBQUFBLE1BQzNCLFFBQVE7QUFBQSxJQUNWO0FBQUEsRUFDRjtBQUFBLEVBQ0EsMEJBQTBCO0FBQUEsSUFDeEI7QUFBQSxNQUNFLFdBQVcsQ0FBQyxXQUFXO0FBQUEsTUFDdkIsU0FBUyxDQUFDLGNBQWMsYUFBYTtBQUFBLElBQ3ZDO0FBQUEsRUFDRjtBQUFBLEVBQ0Esa0JBQWtCLENBQUMsWUFBWTtBQUFBLEVBQy9CLGFBQWEsQ0FBQyxXQUFXLGNBQWM7QUFDekMsQ0FBQzs7O0FEekNELFNBQVMsZUFBZTtBQUV4QixJQUFNLE9BQU8sUUFBUSxJQUFJO0FBRXpCLFNBQVMsWUFBWSxLQUFhO0FBQ2hDLFNBQU8sUUFBUSxNQUFNLEtBQUssR0FBRztBQUMvQjtBQUdBLElBQU8sc0JBQVEsYUFBYSxDQUFDLEVBQUUsU0FBUyxLQUFLLE1BQU07QUFDakQsTUFBSSxNQUFNLENBQUM7QUFDWCxRQUFNLFFBQVEsTUFBTSxJQUFJO0FBQ3hCLFVBQVEsSUFBSSxHQUFHO0FBRWYsU0FBTztBQUFBLElBQ0wsU0FBUztBQUFBLE1BQ1AsWUFBWTtBQUFBLFFBQ1Y7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsTUFDRjtBQUFBLE1BQ0EsT0FBTztBQUFBLFFBQ0w7QUFBQSxVQUNFLE1BQU07QUFBQSxVQUNOLGFBQWEsR0FBRyxZQUFZLEtBQUs7QUFBQSxRQUNuQztBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsSUFDQSxPQUFPO0FBQUEsTUFDTCxhQUFhO0FBQUEsTUFDYixRQUFRO0FBQUEsTUFDUixlQUFlO0FBQUEsUUFDYixTQUFTLENBQUM7QUFBQSxRQUNWLFFBQVE7QUFBQSxVQUNOLGdCQUFnQjtBQUFBLFFBQ2xCO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxJQUNBLFNBQVM7QUFBQSxNQUNQLElBQUksRUFBRSwyQkFBUyxDQUFDO0FBQUEsTUFDaEIsSUFBSTtBQUFBLE1BQ0osUUFBUTtBQUFBLFFBQ04sUUFBUTtBQUFBLFFBQ1IsT0FBTztBQUFBLFFBRVAsYUFBYSxHQUNYLGlCQUFTLGNBQWMsaUJBQVMsS0FBSyxXQUFXLEtBQUssR0FBRyxnQkFDM0MsaUJBQVM7QUFBQSxNQUMxQixDQUFDO0FBQUEsSUFDSDtBQUFBLElBQ0EsUUFBUTtBQUFBLE1BQ04sTUFBTSxTQUFTLElBQUksU0FBVTtBQUFBLE1BQzdCLEtBQUs7QUFBQSxRQUNILFVBQVU7QUFBQSxRQUNWLE1BQU07QUFBQSxNQUNSO0FBQUEsTUFDQSxNQUFNO0FBQUEsSUFDUjtBQUFBLEVBQ0Y7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
