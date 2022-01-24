import createObserver from "./createObserver";
import createOverlayObserver from "./createOverlayObserver";

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
  const isNode = (d: Node) =>
    d.nodeName === tag &&
    Array.from((d as HTMLElement).classList).includes(className);
  return (useBody ? createOverlayObserver : createObserver)((ms) => {
    const nodes = ms.flatMap((m) => [
      ...Array.from(m.addedNodes)
        .filter((d: Node) => isNode(d) || d.hasChildNodes())
        .flatMap((d) =>
          isNode(d)
            ? [d]
            : Array.from((d as HTMLElement).getElementsByClassName(className))
        )
        .map((node) => ({ node, added: true })),
      ...Array.from(m.removedNodes)
        .filter((d: Node) => isNode(d) || d.hasChildNodes())
        .flatMap((d) =>
          isNode(d)
            ? [d]
            : Array.from((d as HTMLElement).getElementsByClassName(className))
        )
        .map((node) => ({ node, added: false })),
    ]);
    nodes.forEach((b) =>
      b.added
        ? callback(b.node as HTMLElement)
        : removeCallback?.(b.node as HTMLElement)
    );
  });
};

export default createHTMLObserver;
