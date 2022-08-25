import ReactDOM from "react-dom";
import dispatchToRegistry from "./dispatchToRegistry";
import removeFromRegistry from "./removeFromRegistry";

const renderWithUnmount = (
  el: React.ReactElement,
  p: HTMLElement
): (() => void) => {
  ReactDOM.render(el, p);
  const unmount = (observer: MutationObserver) => {
    observer.disconnect();
    ReactDOM.unmountComponentAtNode(p);
    removeFromRegistry({
      reactRoots: [p],
      observers: [observer],
    });
  };
  const unmountObserver = new MutationObserver((ms, observer) => {
    const parentRemoved = ms
      .flatMap((m) => Array.from(m.removedNodes))
      .some((n) => n === p || n.contains(p));
    if (parentRemoved) {
      unmount(observer);
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
