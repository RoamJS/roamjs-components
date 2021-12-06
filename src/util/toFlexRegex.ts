const toFlexRegex = (key: string): RegExp =>
  new RegExp(`^\\s*${key}\\s*(#\\.[\\w\\d-]*\\s*)?$`, "i");

export default toFlexRegex;
