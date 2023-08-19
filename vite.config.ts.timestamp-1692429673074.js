// vite.config.ts
import { defineConfig, loadEnv } from "vite";
import { crx } from "@crxjs/vite-plugin";
import vue from "@vitejs/plugin-vue";
import zipPack from "vite-plugin-zip-pack";
import builtins from "rollup-plugin-node-builtins";
import globals from "rollup-plugin-node-globals";
import nodePolyfills from "rollup-plugin-polyfill-node";

// src/manifest.ts
import { defineManifest } from "@crxjs/vite-plugin";
var manifest_default = defineManifest({
  name: "CreMind GPT Extension",
  description: "Unlocking the Potential of AI GPT Technology: Empowering Productivity with this Feature-Packed Extension",
  version: "1.0.3",
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
    default_title: "CreMind Popup Page",
    default_popup: "popup.html"
  },
  options_page: "options.html",
  background: {
    service_worker: "src/background/index.ts",
    type: "module"
  },
  content_scripts: [
    {
      matches: ["http://*/*", "https://*/*"],
      js: ["src/content/index.ts"]
    }
  ],
  web_accessible_resources: [
    {
      resources: ["img/*.png"],
      matches: ["http://*/*", "https://*/*"]
    }
  ],
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
        plugins: [nodePolyfills(), builtins(), globals()],
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiLCAic3JjL21hbmlmZXN0LnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJpbXBvcnQgeyBkZWZpbmVDb25maWcsIGxvYWRFbnYgfSBmcm9tIFwidml0ZVwiO1xuaW1wb3J0IHsgY3J4IH0gZnJvbSBcIkBjcnhqcy92aXRlLXBsdWdpblwiO1xuaW1wb3J0IHZ1ZSBmcm9tIFwiQHZpdGVqcy9wbHVnaW4tdnVlXCI7XG5pbXBvcnQgemlwUGFjayBmcm9tIFwidml0ZS1wbHVnaW4temlwLXBhY2tcIjtcbmltcG9ydCBidWlsdGlucyBmcm9tIFwicm9sbHVwLXBsdWdpbi1ub2RlLWJ1aWx0aW5zXCI7XG5pbXBvcnQgZ2xvYmFscyBmcm9tIFwicm9sbHVwLXBsdWdpbi1ub2RlLWdsb2JhbHNcIjtcbmltcG9ydCBub2RlUG9seWZpbGxzIGZyb20gXCJyb2xsdXAtcGx1Z2luLXBvbHlmaWxsLW5vZGVcIjtcbmltcG9ydCBtYW5pZmVzdCBmcm9tIFwiLi9zcmMvbWFuaWZlc3RcIjtcbmltcG9ydCB7IHJlc29sdmUgfSBmcm9tIFwicGF0aFwiO1xuXG5jb25zdCByb290ID0gcHJvY2Vzcy5jd2QoKTtcblxuZnVuY3Rpb24gcGF0aFJlc29sdmUoZGlyOiBzdHJpbmcpIHtcbiAgcmV0dXJuIHJlc29sdmUocm9vdCwgXCIuXCIsIGRpcik7XG59XG5cbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoKHsgY29tbWFuZCwgbW9kZSB9KSA9PiB7XG4gIGxldCBlbnYgPSB7fSBhcyBhbnk7XG4gIGVudiA9IGxvYWRFbnYobW9kZSwgcm9vdCk7XG4gIGNvbnNvbGUubG9nKGVudik7XG5cbiAgcmV0dXJuIHtcbiAgICByZXNvbHZlOiB7XG4gICAgICBleHRlbnNpb25zOiBbXG4gICAgICAgIFwiLm1qc1wiLFxuICAgICAgICBcIi5qc1wiLFxuICAgICAgICBcIi50c1wiLFxuICAgICAgICBcIi5qc3hcIixcbiAgICAgICAgXCIudHN4XCIsXG4gICAgICAgIFwiLmpzb25cIixcbiAgICAgICAgXCIubGVzc1wiLFxuICAgICAgICBcIi5jc3NcIixcbiAgICAgIF0sXG4gICAgICBhbGlhczogW1xuICAgICAgICB7XG4gICAgICAgICAgZmluZDogL1xcQFxcLy8sXG4gICAgICAgICAgcmVwbGFjZW1lbnQ6IGAke3BhdGhSZXNvbHZlKFwic3JjXCIpfS9gLFxuICAgICAgICB9LFxuICAgICAgXSxcbiAgICB9LFxuICAgIGJ1aWxkOiB7XG4gICAgICBlbXB0eU91dERpcjogdHJ1ZSxcbiAgICAgIG91dERpcjogXCJidWlsZFwiLFxuICAgICAgcm9sbHVwT3B0aW9uczoge1xuICAgICAgICBwbHVnaW5zOiBbbm9kZVBvbHlmaWxscygpLCBidWlsdGlucygpLCBnbG9iYWxzKCldLFxuICAgICAgICBvdXRwdXQ6IHtcbiAgICAgICAgICBjaHVua0ZpbGVOYW1lczogXCJhc3NldHMvY2h1bmstW2hhc2hdLmpzXCIsXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH0sXG4gICAgcGx1Z2luczogW1xuICAgICAgY3J4KHsgbWFuaWZlc3QgfSksXG4gICAgICB2dWUoKSxcbiAgICAgIHppcFBhY2soe1xuICAgICAgICBvdXREaXI6IGBwYWNrYWdlYCxcbiAgICAgICAgaW5EaXI6IFwiYnVpbGRcIixcbiAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICBvdXRGaWxlTmFtZTogYCR7XG4gICAgICAgICAgbWFuaWZlc3Quc2hvcnRfbmFtZSA/PyBtYW5pZmVzdC5uYW1lLnJlcGxhY2VBbGwoXCIgXCIsIFwiLVwiKVxuICAgICAgICB9LWV4dGVuc2lvbi12JHttYW5pZmVzdC52ZXJzaW9ufS56aXBgLFxuICAgICAgfSksXG4gICAgXSxcbiAgICBzZXJ2ZXI6IHtcbiAgICAgIHBvcnQ6IHBhcnNlSW50KGVudi5WSVRFX1BPUlQhKSxcbiAgICAgIGhtcjoge1xuICAgICAgICBwcm90b2NvbDogXCJ3c1wiLFxuICAgICAgICBwb3J0OiA4MDgwLFxuICAgICAgfSxcbiAgICAgIGhvc3Q6IFwiMC4wLjAuMFwiLFxuICAgIH0sXG4gIH07XG59KTtcbiIsICJpbXBvcnQgeyBkZWZpbmVNYW5pZmVzdCB9IGZyb20gXCJAY3J4anMvdml0ZS1wbHVnaW5cIjtcblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lTWFuaWZlc3Qoe1xuICBuYW1lOiBcIkNyZU1pbmQgR1BUIEV4dGVuc2lvblwiLFxuICBkZXNjcmlwdGlvbjpcbiAgICBcIlVubG9ja2luZyB0aGUgUG90ZW50aWFsIG9mIEFJIEdQVCBUZWNobm9sb2d5OiBFbXBvd2VyaW5nIFByb2R1Y3Rpdml0eSB3aXRoIHRoaXMgRmVhdHVyZS1QYWNrZWQgRXh0ZW5zaW9uXCIsXG4gIHZlcnNpb246IFwiMS4wLjNcIixcbiAgbWFuaWZlc3RfdmVyc2lvbjogMyxcbiAgaWNvbnM6IHtcbiAgICBcIjE2XCI6IFwiaW1nL0NyZU1pbmQtbG9nby0xNi5wbmdcIixcbiAgICBcIjQ4XCI6IFwiaW1nL0NyZU1pbmQtbG9nby00OC5wbmdcIixcbiAgICBcIjEyOFwiOiBcImltZy9DcmVNaW5kLWxvZ28tMTI4LnBuZ1wiLFxuICB9LFxuICBhY3Rpb246IHtcbiAgICBkZWZhdWx0X2ljb246IHtcbiAgICAgIFwiMTZcIjogXCJpbWcvQ3JlTWluZC1sb2dvLTE2LnBuZ1wiLFxuICAgICAgXCI0OFwiOiBcImltZy9DcmVNaW5kLWxvZ28tNDgucG5nXCIsXG4gICAgICBcIjEyOFwiOiBcImltZy9DcmVNaW5kLWxvZ28tMTI4LnBuZ1wiLFxuICAgIH0sXG4gICAgZGVmYXVsdF90aXRsZTogXCJDcmVNaW5kIFBvcHVwIFBhZ2VcIixcbiAgICBkZWZhdWx0X3BvcHVwOiBcInBvcHVwLmh0bWxcIixcbiAgfSxcbiAgb3B0aW9uc19wYWdlOiBcIm9wdGlvbnMuaHRtbFwiLFxuICBiYWNrZ3JvdW5kOiB7XG4gICAgc2VydmljZV93b3JrZXI6IFwic3JjL2JhY2tncm91bmQvaW5kZXgudHNcIixcbiAgICB0eXBlOiBcIm1vZHVsZVwiLFxuICB9LFxuICBjb250ZW50X3NjcmlwdHM6IFtcbiAgICB7XG4gICAgICBtYXRjaGVzOiBbXCJodHRwOi8vKi8qXCIsIFwiaHR0cHM6Ly8qLypcIl0sXG4gICAgICBqczogW1wic3JjL2NvbnRlbnQvaW5kZXgudHNcIl0sXG4gICAgfSxcbiAgXSxcbiAgd2ViX2FjY2Vzc2libGVfcmVzb3VyY2VzOiBbXG4gICAge1xuICAgICAgcmVzb3VyY2VzOiBbXCJpbWcvKi5wbmdcIl0sXG4gICAgICBtYXRjaGVzOiBbXCJodHRwOi8vKi8qXCIsIFwiaHR0cHM6Ly8qLypcIl0sXG4gICAgfSxcbiAgXSxcbiAgcGVybWlzc2lvbnM6IFtcInN0b3JhZ2VcIiwgXCJjb250ZXh0TWVudXNcIl0sXG59KTtcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBQSxTQUFTLGNBQWMsZUFBZTtBQUN0QyxTQUFTLFdBQVc7QUFDcEIsT0FBTyxTQUFTO0FBQ2hCLE9BQU8sYUFBYTtBQUNwQixPQUFPLGNBQWM7QUFDckIsT0FBTyxhQUFhO0FBQ3BCLE9BQU8sbUJBQW1COzs7QUNOMUIsU0FBUyxzQkFBc0I7QUFFL0IsSUFBTyxtQkFBUSxlQUFlO0FBQUEsRUFDNUIsTUFBTTtBQUFBLEVBQ04sYUFDRTtBQUFBLEVBQ0YsU0FBUztBQUFBLEVBQ1Qsa0JBQWtCO0FBQUEsRUFDbEIsT0FBTztBQUFBLElBQ0wsTUFBTTtBQUFBLElBQ04sTUFBTTtBQUFBLElBQ04sT0FBTztBQUFBLEVBQ1Q7QUFBQSxFQUNBLFFBQVE7QUFBQSxJQUNOLGNBQWM7QUFBQSxNQUNaLE1BQU07QUFBQSxNQUNOLE1BQU07QUFBQSxNQUNOLE9BQU87QUFBQSxJQUNUO0FBQUEsSUFDQSxlQUFlO0FBQUEsSUFDZixlQUFlO0FBQUEsRUFDakI7QUFBQSxFQUNBLGNBQWM7QUFBQSxFQUNkLFlBQVk7QUFBQSxJQUNWLGdCQUFnQjtBQUFBLElBQ2hCLE1BQU07QUFBQSxFQUNSO0FBQUEsRUFDQSxpQkFBaUI7QUFBQSxJQUNmO0FBQUEsTUFDRSxTQUFTLENBQUMsY0FBYyxhQUFhO0FBQUEsTUFDckMsSUFBSSxDQUFDLHNCQUFzQjtBQUFBLElBQzdCO0FBQUEsRUFDRjtBQUFBLEVBQ0EsMEJBQTBCO0FBQUEsSUFDeEI7QUFBQSxNQUNFLFdBQVcsQ0FBQyxXQUFXO0FBQUEsTUFDdkIsU0FBUyxDQUFDLGNBQWMsYUFBYTtBQUFBLElBQ3ZDO0FBQUEsRUFDRjtBQUFBLEVBQ0EsYUFBYSxDQUFDLFdBQVcsY0FBYztBQUN6QyxDQUFDOzs7QURoQ0QsU0FBUyxlQUFlO0FBRXhCLElBQU0sT0FBTyxRQUFRLElBQUk7QUFFekIsU0FBUyxZQUFZLEtBQWE7QUFDaEMsU0FBTyxRQUFRLE1BQU0sS0FBSyxHQUFHO0FBQy9CO0FBR0EsSUFBTyxzQkFBUSxhQUFhLENBQUMsRUFBRSxTQUFTLEtBQUssTUFBTTtBQUNqRCxNQUFJLE1BQU0sQ0FBQztBQUNYLFFBQU0sUUFBUSxNQUFNLElBQUk7QUFDeEIsVUFBUSxJQUFJLEdBQUc7QUFFZixTQUFPO0FBQUEsSUFDTCxTQUFTO0FBQUEsTUFDUCxZQUFZO0FBQUEsUUFDVjtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxNQUNGO0FBQUEsTUFDQSxPQUFPO0FBQUEsUUFDTDtBQUFBLFVBQ0UsTUFBTTtBQUFBLFVBQ04sYUFBYSxHQUFHLFlBQVksS0FBSztBQUFBLFFBQ25DO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxJQUNBLE9BQU87QUFBQSxNQUNMLGFBQWE7QUFBQSxNQUNiLFFBQVE7QUFBQSxNQUNSLGVBQWU7QUFBQSxRQUNiLFNBQVMsQ0FBQyxjQUFjLEdBQUcsU0FBUyxHQUFHLFFBQVEsQ0FBQztBQUFBLFFBQ2hELFFBQVE7QUFBQSxVQUNOLGdCQUFnQjtBQUFBLFFBQ2xCO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxJQUNBLFNBQVM7QUFBQSxNQUNQLElBQUksRUFBRSwyQkFBUyxDQUFDO0FBQUEsTUFDaEIsSUFBSTtBQUFBLE1BQ0osUUFBUTtBQUFBLFFBQ04sUUFBUTtBQUFBLFFBQ1IsT0FBTztBQUFBLFFBRVAsYUFBYSxHQUNYLGlCQUFTLGNBQWMsaUJBQVMsS0FBSyxXQUFXLEtBQUssR0FBRyxnQkFDM0MsaUJBQVM7QUFBQSxNQUMxQixDQUFDO0FBQUEsSUFDSDtBQUFBLElBQ0EsUUFBUTtBQUFBLE1BQ04sTUFBTSxTQUFTLElBQUksU0FBVTtBQUFBLE1BQzdCLEtBQUs7QUFBQSxRQUNILFVBQVU7QUFBQSxRQUNWLE1BQU07QUFBQSxNQUNSO0FBQUEsTUFDQSxNQUFNO0FBQUEsSUFDUjtBQUFBLEVBQ0Y7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
