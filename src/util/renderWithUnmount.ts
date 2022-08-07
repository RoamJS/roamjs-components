import ReactDOM from "react-dom";

const renderWithUnmount = (el: React.ReactElement, p: HTMLElement): void => {
  ReactDOM.render(el, p);
  const unmountObserver = new MutationObserver((ms) => {
    const parentRemoved = ms
      .flatMap((m) => Array.from(m.removedNodes))
      .some((n) => n === p || n.contains(p));
    if (parentRemoved) {
      unmountObserver.disconnect();
      ReactDOM.unmountComponentAtNode(p);
      document.body.dispatchEvent(
        new CustomEvent(
          `roamjs:${process.env.ROAMJS_EXTENSION_ID}:unregister`,
          {
            detail: {
              reactRoots: [p],
              observers: [unmountObserver],
            },
          }
        )
      );
    }
  });
  unmountObserver.observe(document.body, { childList: true, subtree: true });
  document.body.dispatchEvent(
    new CustomEvent(`roamjs:${process.env.ROAMJS_EXTENSION_ID}:register`, {
      detail: {
        reactRoots: [p],
        observers: [unmountObserver],
      },
    })
  );
};

export default renderWithUnmount;
