import createObserver from "./createObserver";
import createOverlayObserver from "./createOverlayObserver";
import getMutatedNodes from "./getMutatedNodes";

const createHTMLObserver = ({
  callback,
  tag,
  className,
  removeCallback,
  useBody,
}: {
  callback: (b: HTMLElement) => void;
  tag: string;
  className: string;
  removeCallback?: (b: HTMLElement) => void;
  useBody?: boolean;
}): MutationObserver => {
  const blocks = document.getElementsByClassName(
    className
  ) as HTMLCollectionOf<HTMLElement>;
  Array.from(blocks).forEach(callback);
  return (useBody ? createOverlayObserver : createObserver)((ms) => {
    const addedNodes = getMutatedNodes({
      ms,
      nodeList: "addedNodes",
      tag,
      className,
    });
    addedNodes.map((n) => n as HTMLElement).forEach(callback);
    if (removeCallback) {
      const removedNodes = getMutatedNodes({
        ms,
        nodeList: "removedNodes",
        tag,
        className,
      });
      removedNodes.map((n) => n as HTMLElement).forEach(removeCallback);
    }
  });
};

export default createHTMLObserver;
