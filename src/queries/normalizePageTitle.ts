const normalizePageTitle = (title: string): string =>
  title.replace(/\\/g, "\\\\").replace(/"/g, '\\"');

export default normalizePageTitle;
