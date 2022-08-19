import dispatchToRegistry from "../util/dispatchToRegistry";

const createDivObserver = (
  mutationCallback: MutationCallback,
  mutationTarget: Element
) => {
  const observer = new MutationObserver(mutationCallback);
  observer.observe(mutationTarget, { childList: true, subtree: true });
  dispatchToRegistry({
    observers: [observer],
  });
  return observer;
};

export default createDivObserver;
