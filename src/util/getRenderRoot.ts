const getRenderRoot = (id: string): HTMLDivElement => {
  const app = document.getElementById("app");
  const newRoot = document.createElement("div");
  newRoot.id = `roamjs-${id}-root`;
  app?.parentElement?.appendChild(newRoot);
  return newRoot;
};

export default getRenderRoot;
