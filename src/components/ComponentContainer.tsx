import { Button } from "@blueprintjs/core";
import React, { useCallback, useState } from "react";
import ReactDOM from "react-dom";
import { getBlockUidFromTarget, openBlock } from "../dom";

const ComponentContainer: React.FunctionComponent<{
  blockId?: string;
  className?: string;
}> = ({ blockId, className, children }) => {
  const [showIcons, setShowIcons] = useState(false);
  const appear = useCallback(() => setShowIcons(true), [setShowIcons]);
  const disappear = useCallback(() => setShowIcons(false), [setShowIcons]);

  return (
    <div
      className={className}
      onMouseOver={appear}
      onMouseLeave={disappear}
      style={{ position: "relative", width: "fit-content", minWidth: 300 }}
    >
      {showIcons && (
        <div style={{ position: "absolute", top: 8, right: 8, zIndex: 1000 }}>
          {blockId && (
            <Button icon="edit" minimal onClick={() => openBlock(blockId)} />
          )}
        </div>
      )}
      {children}
    </div>
  );
};

const renderWithUnmount = (el: React.ReactElement, p: HTMLElement): void => {
  ReactDOM.render(el, p);
  const unmountObserver = new MutationObserver((ms) => {
    const parentRemoved = ms
      .flatMap((m) => Array.from(m.removedNodes))
      .some((n) => n === p || n.contains(p));
    if (parentRemoved) {
      unmountObserver.disconnect();
      ReactDOM.unmountComponentAtNode(p);
    }
  });
  unmountObserver.observe(document.body, { childList: true, subtree: true });
};

export const createComponentRender =
  (
    Fc: (props: { blockUid: string }) => React.ReactElement,
    className?: string
  ) =>
  (b: HTMLButtonElement): void => {
    if (b.parentElement) {
      b.parentElement.onmousedown = (e: MouseEvent) => e.stopPropagation();
      const blockUid = getBlockUidFromTarget(b);
      const possibleBlockId = b.closest(".roam-block")?.id;
      const blockId = possibleBlockId?.endsWith?.(blockUid)
        ? possibleBlockId
        : undefined;
      if (blockUid) {
        renderWithUnmount(
          <ComponentContainer blockId={blockId} className={className}>
            <Fc blockUid={blockUid} />
          </ComponentContainer>,
          b.parentElement
        );
      }
    }
  };

export default ComponentContainer;
