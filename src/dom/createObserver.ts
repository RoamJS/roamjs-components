import createDivObserver from "./createDivObserver";

const createObserver = (
  mutationCallback: (
    mutationList: MutationRecord[],
    observer: MutationObserver
  ) => void
): MutationObserver => {
  return createDivObserver(
    mutationCallback,
    document.getElementById("app") ?? document.body
  );
};

export default createObserver;
