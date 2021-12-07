import createDivObserver from "./createDivObserver";

const createObserver = (
  mutationCallback: (
    mutationList: MutationRecord[],
    observer: MutationObserver
  ) => void
): void =>
  createDivObserver(
    mutationCallback,
    document.getElementsByClassName("roam-body")[0]
  );

export default createObserver;
