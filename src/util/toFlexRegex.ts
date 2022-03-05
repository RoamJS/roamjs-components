const toFlexRegex = (key: string): RegExp =>
  new RegExp(
    `^\\s*${key.replace(/([()])/g, "\\$1")}\\s*(#\\.[\\w\\d-]*\\s*)?$`,
    "i"
  );

export default toFlexRegex;
