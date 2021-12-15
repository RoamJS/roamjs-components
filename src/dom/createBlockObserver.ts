import createHTMLObserver from "./createHTMLObserver";

const createBlockObserver = (
  blockCallback: (b: HTMLDivElement) => void,
  blockRefCallback?: (b: HTMLSpanElement) => void
): MutationObserver[] => {
  const blockObserver = createHTMLObserver({
    callback: (e) => blockCallback(e as HTMLDivElement),
    tag: "DIV",
    className: "roam-block",
  });
  if (blockRefCallback) {
    return [blockObserver, createHTMLObserver({
      callback: blockRefCallback,
      tag: "SPAN",
      className: "rm-block-ref",
    })];
  }
  return [blockObserver]
};

export default createBlockObserver;
