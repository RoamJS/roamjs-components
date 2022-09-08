// @DEPRECATED

const getRenderRoot = (id: string): HTMLDivElement => {
  const rootId = `roamjs-${id}-root`;
  const existing = document.getElementById(rootId) as HTMLDivElement;
  if (existing) {
    existing.setAttribute("data-existing", "true");
    return existing;
  }
  const app = document.getElementById("app");
  const newRoot = document.createElement("div");
  newRoot.id = rootId;
  app?.parentElement?.appendChild(newRoot);
  return newRoot;
};

export default getRenderRoot;
