import json from "@rollup/plugin-json";
import vuePlugin from "rollup-plugin-vue";
import {
  chromeExtension,
  simpleReloader,
} from "rollup-plugin-chrome-extension";
import { emptyDir } from "rollup-plugin-empty-dir";
import typescript from "rollup-plugin-typescript2"; // '@rollup/plugin-typescript'
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import replace from "@rollup/plugin-replace";
import postcss from "rollup-plugin-postcss";
import alias from "rollup-plugin-alias";
import { terser } from "rollup-plugin-terser";
import _dotenv from "dotenv/config";
import path from "path";

export default {
  external: ["crypto"],
  input: "src/manifest.json",
  output: {
    dir: "dist",
    format: "esm",
    chunkFileNames: "chunks/[name]-[hash].js",
  },
  onwarn: (warning, defaultHandler) => {
    if (warning.code === "THIS_IS_UNDEFINED") return;
    defaultHandler(warning);
  },
  // watch: { clearScreen: false }, // for dev debug
  plugins: [
    alias({
      entries: {
        ["@"]: path.resolve(__dirname, "src"),
      },
    }),
    // chromeExtension() must be first, in order to properly treat manifest.json as the entry point
    chromeExtension({
      extendManifest: {
        //"oauth2": {
        //  "client_id": process.env.VUE_APP_OAUTH2_CLIENT_ID,
        //  "scopes": [
        //    "https://www.googleapis.com/auth/userinfo.email",
        //    "https://www.googleapis.com/auth/userinfo.profile"
        //  ]
        //},
        key: process.env.VUE_APP_MV3_KEY,
      },
    }),
    simpleReloader(), // Adds a Chrome extension reloader during watch mode
    vuePlugin({ target: "browser" }),
    replace({
      __VUE_OPTIONS_API__: true,
      __VUE_PROD_DEVTOOLS__: false,
      "process.env.NODE_ENV": JSON.stringify("production"),
      "process.env.VUE_APP_LOG_LEVEL": JSON.stringify(
        process.env.VUE_APP_LOG_LEVEL
      ),
      "process.env.VUE_APP_CRYPTO_SECRET_KEY": JSON.stringify(
        process.env.VUE_APP_CRYPTO_SECRET_KEY
      ),
      "process.env.VUE_APP_CRYPTO_CONFIG_JSON": JSON.stringify(
        process.env.VUE_APP_CRYPTO_CONFIG_JSON
      ),
      preventAssignment: true,
    }),
    typescript(),
    postcss(),
    json(),
    resolve({
      customResolveOptions: {
        moduleDirectories: "node_modules",
      },
      preferBuiltins: true,
    }),
    commonjs(),
    emptyDir(),
    terser(),
  ],
};
