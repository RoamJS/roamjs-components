const createTagRegex = (tag: string): RegExp =>
  new RegExp(`#?\\[\\[${tag}\\]\\]|#${tag}`);

export default createTagRegex;
