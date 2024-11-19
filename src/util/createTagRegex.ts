const createTagRegex = (title: string): RegExp => {
  const escapedTitle = title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(
    `(?:#\\[\\[${escapedTitle}\\]\\]|#${escapedTitle}(?!\\w)|\\[\\[${escapedTitle}\\]\\])`
  );
};
export default createTagRegex;
