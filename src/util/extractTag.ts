const extractTag = (tag: string): string =>
  tag.startsWith("#[[") && tag.endsWith("]]")
    ? tag.substring(3, tag.length - 2)
    : tag.startsWith("[[") && tag.endsWith("]]")
    ? tag.substring(2, tag.length - 2)
    : tag.startsWith("#")
    ? tag.substring(1)
    : tag.endsWith("::")
    ? tag.substring(0, tag.length - 2)
    : tag;

export default extractTag;
