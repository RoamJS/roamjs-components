const fs = require("fs");

const mod = "date";
const fil = fs.readFileSync(`./src/${mod}/index.ts`).toString();
const [imports, ...methods] = fil.split("\n\n");
const importData = imports
  .split("\n")
  .map((l) => ({ l, module: /^import ([a-z]+) from/.exec(l)[1] }));
const methodData = methods.map((l) => ({
  l: l,
  name: /^export const ([a-zA-Z_]+) =/.exec(l)[1],
}));

const methodExports = methodData
  .filter(({ name }) => name.toUpperCase() !== name)
  .map(({ l, name }) => {
    const importsForMethod = importData
      .filter((i) => l.includes(i.module))
      .map((i) => i.l)
      .join("\n");
    fs.writeFileSync(
      `./src/${mod}/${name}`,
      `${importsForMethod}\n\n${l.replace(
        /^export /,
        ""
      )}\n\nexport default ${name};\n`
    );
    return `export { default as ${name} } from "./${name}";`;
  });

fs.writeFileSync(
  `./src/${mod}/index.ts`,
  `${methodExports.join("\n")}\n${methodData
    .filter(({ name }) => name.toUpperCase() === name)
    .map(({ l }) => l)
    .join("\n")}\n`
);
