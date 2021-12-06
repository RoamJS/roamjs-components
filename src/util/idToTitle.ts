const idToTitle = (id: string): string =>
  id
    .split(/[\s-]/)
    .map((s) => `${s.substring(0, 1).toUpperCase()}${s.substring(1)}`)
    .join(" ")
    .replace(/_/g, " ");

export default idToTitle;
