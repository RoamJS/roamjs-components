import createDivObserver from "./createDivObserver";

const createObserver = (
  mutationCallback: (
    mutationList: MutationRecord[],
    observer: MutationObserver
  ) => void
): MutationObserver => {
  return createDivObserver(
    mutationCallback,
    document.getElementsByClassName("app")[0]
  );
};

export default createObserver;
