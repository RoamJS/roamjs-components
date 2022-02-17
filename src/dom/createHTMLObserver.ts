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
  const getChildren = (d: Node) =>
    Array.from((d as HTMLElement).getElementsByClassName(className)).filter(
      (d) => d.nodeName === tag
    ) as HTMLElement[];
  getChildren(document).forEach(callback);

  const isNode = (d: Node) =>
    d.nodeName === tag &&
    Array.from((d as HTMLElement).classList).includes(className);
  const getNodes = (nodes: NodeList) =>
    Array.from(nodes)
      .filter((d: Node) => isNode(d) || d.hasChildNodes())
      .flatMap((d) => (isNode(d) ? [d] : getChildren(d)));

  return (useBody ? createOverlayObserver : createObserver)((ms) => {
    const nodes = ms.flatMap((m) => [
      ...getNodes(m.addedNodes).map((node) => ({ node, added: true })),
      ...getNodes(m.removedNodes).map((node) => ({ node, added: false })),
    ]);
    nodes.forEach((b) =>
      b.added
        ? callback(b.node as HTMLElement)
        : removeCallback?.(b.node as HTMLElement)
    );
  });
};

export default createHTMLObserver;
