import { defineConfig, loadEnv } from "vite";
import { crx } from "@crxjs/vite-plugin";
import vue from "@vitejs/plugin-vue";
import zipPack from "vite-plugin-zip-pack";
import builtins from "rollup-plugin-node-builtins";
import globals from "rollup-plugin-node-globals";
import nodePolyfills from "rollup-plugin-polyfill-node";
import manifest from "./src/manifest";
import { resolve } from "path";

const root = process.cwd();

function pathResolve(dir: string) {
  return resolve(root, ".", dir);
}

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  let env = {} as any;
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
        ".css",
      ],
      alias: [
        {
          find: /\@\//,
          replacement: `${pathResolve("src")}/`,
        },
      ],
    },
    build: {
      emptyOutDir: true,
      outDir: "build",
      rollupOptions: {
        plugins: [nodePolyfills(), builtins(), globals()],
        output: {
          chunkFileNames: "assets/chunk-[hash].js",
        },
      },
    },
    plugins: [
      crx({ manifest }),
      vue(),
      zipPack({
        outDir: `package`,
        inDir: "build",
        // @ts-ignore
        outFileName: `${
          manifest.short_name ?? manifest.name.replaceAll(" ", "-")
        }-extension-v${manifest.version}.zip`,
      }),
    ],
    server: {
      port: parseInt(env.VITE_PORT!),
      hmr: {
        protocol: "ws",
        port: 8080,
      },
      host: "0.0.0.0",
    },
  };
});
