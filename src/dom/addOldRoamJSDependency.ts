import addScriptAsDependency from "./addScriptAsDependency";

const addOldRoamJSDependency = (extension: string, source?: string): void =>
  addScriptAsDependency({
    id: `roamjs-${extension.replace(/\/main$/, "")}`,
    src: `https://roamjs.com/${extension}.js`,
    dataAttributes: source ? { source } : {},
  });

export default addOldRoamJSDependency;
