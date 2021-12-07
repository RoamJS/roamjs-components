const normalizePageTitle = (title: string): string =>
  title.replace(/\\/, "\\\\").replace(/"/g, '\\"');

export default normalizePageTitle;
