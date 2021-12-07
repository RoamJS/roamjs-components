const createBlockObserver = (
  blockCallback: (b: HTMLDivElement) => void,
  blockRefCallback?: (b: HTMLSpanElement) => void
): void => {
  createHTMLObserver({
    callback: (e) => blockCallback(e as HTMLDivElement),
    tag: "DIV",
    className: "roam-block",
  });
  if (blockRefCallback) {
    createHTMLObserver({
      callback: blockRefCallback,
      tag: "SPAN",
      className: "rm-block-ref",
    });
  }
};

export default createBlockObserver;
