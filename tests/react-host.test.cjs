const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const ts = require("typescript");

test("initializing and unloading extensions preserves the host React hook", () => {
  const nativeHook = () => 42;
  const react = Object.freeze({ useSyncExternalStore: nativeHook });
  const window = { React: react };
  const body = { addEventListener() {}, removeEventListener() {} };
  const module = { exports: {} };
  const source = ts.transpileModule(
    fs.readFileSync("src/util/runExtension.ts", "utf8"),
    {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2020,
      },
    }
  ).outputText;
  vm.runInNewContext(source, {
    module,
    exports: module.exports,
    window,
    document: { body, getElementById: () => null },
    require: (name) => {
      if (name === "./env") return { getRoamJSExtensionIdEnv: () => "test" };
      if (name === "use-sync-external-store/shim") {
        throw new Error(
          "Extension initialization must not load the React 17 shim"
        );
      }
      return {};
    },
  });
  const first = module.exports.default(async () => {});
  const second = module.exports.default(async () => {});
  assert.equal(window.React, react);
  assert.equal(window.React.useSyncExternalStore, nativeHook);
  first.onunload();
  second.onunload();
  assert.equal(window.React.useSyncExternalStore, nativeHook);
});

test("the configured React external exports the host without modifying it", () => {
  const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
  const mapping = pkg.samepage.external.find((entry) =>
    entry.startsWith("react=")
  );
  const react = Object.freeze({ useSyncExternalStore: () => 42 });
  const module = { exports: {} };
  vm.runInNewContext(`module.exports = ${mapping.slice("react=".length)};`, {
    module,
    window: { React: react },
  });
  assert.equal(module.exports, react);
  assert.equal(module.exports.useSyncExternalStore(), 42);
});
