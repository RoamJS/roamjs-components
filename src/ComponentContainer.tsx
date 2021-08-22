import { Button } from "@blueprintjs/core";
import React, { useCallback, useState } from "react";
import { getBlockUidFromTarget, openBlock } from "roam-client";
import { renderWithUnmount } from "./hooks";

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
      style={{ position: "relative", width: 'fit-content', minWidth: 300 }}
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
