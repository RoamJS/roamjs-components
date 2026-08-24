#!/usr/bin/env node

import esbuild, { BuildOptions, Plugin } from "esbuild";
import { spawnSync } from "child_process";
import fs from "fs";
import path from "path";

const POSTHOG_CLI_VERSION = "0.11.3";

type PackageMetadata = {
  name?: string;
  version?: string;
};

const getPackageMetadata = (): PackageMetadata => {
  try {
    return JSON.parse(
      fs.readFileSync(path.resolve("package.json")).toString()
    ) as PackageMetadata;
  } catch {
    return {};
  }
};

const hasPostHogSourceMapConfig = (): boolean =>
  Boolean(
    process.env.POSTHOG_CLI_API_KEY &&
      process.env.POSTHOG_CLI_PROJECT_ID &&
      process.env.POSTHOG_CLI_HOST
  );

const uploadPostHogSourceMaps = ({
  directory,
}: {
  directory: string;
}): void => {
  if (!hasPostHogSourceMapConfig()) {
    return;
  }

  const packageMetadata = getPackageMetadata();
  const releaseName =
    packageMetadata.name || process.env.PACKAGE_NAME || "roamjs";
  const releaseVersion =
    process.env.VERSION || packageMetadata.version || "unknown";
  const executable = process.platform === "win32" ? "npx.cmd" : "npx";
  const result = spawnSync(
    executable,
    [
      "--yes",
      `@posthog/cli@${POSTHOG_CLI_VERSION}`,
      "sourcemap",
      "process",
      "--directory",
      directory,
      "--release-name",
      releaseName,
      "--release-version",
      releaseVersion,
      "--delete-after",
    ],
    { stdio: "inherit" }
  );

  if (result.status !== 0) {
    throw new Error("Failed to upload source maps to PostHog.");
  }
};

const postHogSourceMapPlugin = ({
  directory,
}: {
  directory: string;
}): Plugin => ({
  name: "posthog-source-maps",
  setup: (build): void => {
    build.onEnd((result): void => {
      if (!result.errors.length) {
        uploadPostHogSourceMaps({ directory });
      }
    });
  },
});

const originalBuild = esbuild.build;
const buildWithPostHogSourceMaps = (
  options: BuildOptions
): ReturnType<typeof esbuild.build> => {
  const isProductionBrowserBuild =
    process.env.NODE_ENV === "production" && options.platform !== "node";
  if (!isProductionBrowserBuild || !options.outdir) {
    return originalBuild(options);
  }

  return originalBuild({
    ...options,
    sourcemap: "linked",
    plugins: [
      ...(options.plugins || []),
      postHogSourceMapPlugin({ directory: options.outdir }),
    ],
  });
};

type NodeModuleLoader = (
  request: string,
  parent: NodeModule | null,
  isMain: boolean
) => unknown;

// The SamePage CLI owns the esbuild call, so substitute its build function at
// module-load time while leaving the remainder of the esbuild API untouched.
/* eslint-disable @typescript-eslint/no-var-requires */
const nodeModule = require("module") as { _load: NodeModuleLoader };
/* eslint-enable @typescript-eslint/no-var-requires */
const originalModuleLoader = nodeModule._load;
const esbuildProxy = new Proxy(esbuild, {
  get: (target, property, receiver) =>
    property === "build"
      ? buildWithPostHogSourceMaps
      : Reflect.get(target, property, receiver),
});
nodeModule._load = (request, parent, isMain) =>
  request === "esbuild"
    ? esbuildProxy
    : originalModuleLoader(request, parent, isMain);

import("@samepage/scripts/cli");
