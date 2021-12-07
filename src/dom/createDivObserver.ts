

const createDivObserver = (
  mutationCallback: MutationCallback,
  mutationTarget: Element
) => {
  const observer = new MutationObserver(mutationCallback);
  observer.observe(mutationTarget, { childList: true, subtree: true });
}

export default createDivObserver;
