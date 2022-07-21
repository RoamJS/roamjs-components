const esbuild = require("esbuild").build;
const NodeModulesPolyfills =
  require("@esbuild-plugins/node-modules-polyfill").default;
const fs = require("fs");

if (fs.existsSync("build"))
  fs.rmSync("build", { recursive: true, force: true });

const outfile = "build/main.js";
esbuild({
  entryPoints: ["./src/components.tsx"],
  minify: false,
  bundle: true,
  outfile,
  format: "cjs",
  platform: "browser",
  define: {
    "process.env.ROAMJS_VERSION": '"development"',
    "process.env.ROAM_MARKETPLACE": "false",
    "process.env.ROAM_DEPOT": "false",
    "process.env.CLIENT_SIDE": "true",
    "process.env.BLUEPRINT_NAMESPACE": '"bp3"',
    "process.env.CUSTOM_ROAMJS_ORIGIN": '"https://roamjs.com"',
  },
  external: [
    // "react": ""
  ],
  plugins: [NodeModulesPolyfills()],
}).then((e) => {
  const contents = fs.readFileSync(outfile, "utf8");
  fs.writeFileSync(outfile, contents.replace("module.exports = ", ``));
  const stats = fs.statSync(outfile);
  const fileSizeInBytes = stats.size;
  console.log("done. file size in MB:", fileSizeInBytes / (1024 * 1024));
});
