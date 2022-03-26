const esbuild = require("esbuild").build;
const NodeModulesPolyfills = require("@esbuild-plugins/node-modules-polyfill").default;

esbuild({
  entryPoints: ["./src/main.ts"],
  minify: false,
  bundle: true,
  outdir: "build",
  define: {
    "process.env.CLIENT_SIDE": "true",
    "process.env.BLUEPRINT_NAMESPACE": '"bp3"',
    "process.env.CUSTOM_ROAMJS_ORIGIN": '"https://roamjs.com"'
  },
  plugins: [NodeModulesPolyfills()],
  //   external: ["crypto"],
}).then((e) => console.log("done", e));
