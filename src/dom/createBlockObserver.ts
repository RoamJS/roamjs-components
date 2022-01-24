import createHTMLObserver from "./createHTMLObserver";

const createBlockObserver = (
  blockCallbackOrConfig:
    | ((b: HTMLDivElement) => void)
    | {
        onBlockLoad?: (b: HTMLDivElement) => void;
        onBlockUnload?: (b: HTMLDivElement) => void;
        onBlockRefLoad?: (b: HTMLSpanElement) => void;
        onBlockRefUnload?: (b: HTMLSpanElement) => void;
      },
  blockRefCallback?: (b: HTMLSpanElement) => void
): MutationObserver[] => {
  const blockObserver = createHTMLObserver({
    callback: (e) =>
      typeof blockCallbackOrConfig === "function"
        ? blockCallbackOrConfig(e as HTMLDivElement)
        : blockCallbackOrConfig.onBlockLoad?.(e as HTMLDivElement),
    removeCallback: (e) =>
      typeof blockCallbackOrConfig === "object" &&
      blockCallbackOrConfig.onBlockUnload?.(e as HTMLDivElement),
    tag: "DIV",
    className: "roam-block",
  });
  if (blockRefCallback) {
    return [
      blockObserver,
      createHTMLObserver({
        callback: (e) =>
          typeof blockCallbackOrConfig === "object"
            ? blockCallbackOrConfig.onBlockRefLoad?.(e as HTMLSpanElement)
            : blockRefCallback?.(e as HTMLSpanElement),
        removeCallback: (e) =>
          typeof blockCallbackOrConfig === "object" &&
          blockCallbackOrConfig.onBlockRefUnload?.(e as HTMLSpanElement),
        tag: "SPAN",
        className: "rm-block-ref",
      }),
    ];
  }
  return [blockObserver];
};

export default createBlockObserver;
