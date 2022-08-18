import ReactDOM from "react-dom";
import dispatchToRegistry from "./dispatchToRegistry";
import removeFromRegistry from "./removeFromRegistry";

const renderWithUnmount = (el: React.ReactElement, p: HTMLElement): void => {
  ReactDOM.render(el, p);
  const unmountObserver = new MutationObserver((ms) => {
    const parentRemoved = ms
      .flatMap((m) => Array.from(m.removedNodes))
      .some((n) => n === p || n.contains(p));
    if (parentRemoved) {
      unmountObserver.disconnect();
      ReactDOM.unmountComponentAtNode(p);
      removeFromRegistry({
        reactRoots: [p],
        observers: [unmountObserver],
      });
    }
  });
  unmountObserver.observe(document.body, { childList: true, subtree: true });
  dispatchToRegistry({
    reactRoots: [p],
    observers: [unmountObserver],
  });
};

export default renderWithUnmount;
