import React from "react";
import ReactDOM from "react-dom";
import ExtensionApiContextProvider from "../components/ExtensionApiContext";
import { OnloadArgs } from "../types";
import dispatchToRegistry from "./dispatchToRegistry";
import removeFromRegistry from "./removeFromRegistry";

const renderWithUnmount = (
  el: React.ReactElement,
  p: HTMLElement,
  args?: OnloadArgs
): (() => void) => {
  const oldChildren = p.children;
  ReactDOM.render(
    React.createElement(ExtensionApiContextProvider, args, el),
    p
  );
  const unmount = (observer: MutationObserver) => {
    observer.disconnect();
    ReactDOM.unmountComponentAtNode(p);
    removeFromRegistry({
      reactRoots: [p],
      observers: [observer],
    });
    if (oldChildren.length && document.body.contains(p)) {
      Array.from(oldChildren).forEach((c) => p.appendChild(c));
    }
  };
  const unmountObserver = new MutationObserver((ms, observer) => {
    const addedNodes: Node[] = [];
    const parentRemoved = ms
      .flatMap((m) => {
        addedNodes.push(...Array.from(m.addedNodes));
        return Array.from(m.removedNodes);
      })
      .some((n) => n === p || n.contains(p));
    if (parentRemoved) {
      const isNodeAdded = addedNodes.some((n) => n.contains(p));
      if (!isNodeAdded) unmount(observer);
    }
  });
  unmountObserver.observe(document.body, { childList: true, subtree: true });
  dispatchToRegistry({
    reactRoots: [p],
    observers: [unmountObserver],
  });
  return () => unmount(unmountObserver);
};

export default renderWithUnmount;
