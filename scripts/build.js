const esbuild = require("esbuild").build;
const NodeModulesPolyfills = require("@esbuild-plugins/node-modules-polyfill").default;

esbuild({
  entryPoints: ["./src/components.ts"],
  minify: false,
  bundle: true,
  outdir: "build",
  format: "esm",
  define: {
    "process.env.CLIENT_SIDE": "true",
    "process.env.BLUEPRINT_NAMESPACE": '"bp3"',
    "process.env.CUSTOM_ROAMJS_ORIGIN": '"https://roamjs.com"'
  },
  external: {
    // "react": ""
  },
  plugins: [NodeModulesPolyfills()],
  //   external: ["crypto"],
}).then((e) => console.log("done", e));
