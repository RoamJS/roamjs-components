import createDivObserver from "./createDivObserver";

const createOverlayObserver = (
  mutationCallback: (mutationList: MutationRecord[]) => void
): MutationObserver => createDivObserver(mutationCallback, document.body);

export default createOverlayObserver;
