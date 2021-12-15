import createDivObserver from "./createDivObserver";

const createObserver = (
  mutationCallback: (
    mutationList: MutationRecord[],
    observer: MutationObserver
  ) => void
): MutationObserver =>
  createDivObserver(
    mutationCallback,
    document.getElementsByClassName("roam-body")[0]
  );

export default createObserver;
