const fs = require('fs');
const content = fs.readFileSync('./dist/index.d.ts');
fs.writeFileSync('./dist/index.d.ts', `${content}
declare module "*.svg" {
  const value: React.FunctionComponent<React.SVGAttributes<SVGElement>>;
  export = value;
}`)