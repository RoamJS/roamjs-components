import createDivObserver from "./createDivObserver";

const createOverlayObserver = (
  mutationCallback: (mutationList: MutationRecord[]) => void
): void => createDivObserver(mutationCallback, document.body);

export default createOverlayObserver;
