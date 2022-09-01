import { Button } from "@blueprintjs/core";
import React, { useCallback, useState } from "react";
import getUidsFromId from "../dom/getUidsFromId";
import getBlockUidFromTarget from "../dom/getBlockUidFromTarget";
import renderWithUnmount from "../util/renderWithUnmount";
import { OnloadArgs } from "../types/native";

const ComponentContainer: React.FunctionComponent<{
  blockId?: string;
  className?: string;
}> = ({ blockId, className, children }) => {
  const [showIcons, setShowIcons] = useState(false);
  const appear = useCallback(() => setShowIcons(true), [setShowIcons]);
  const disappear = useCallback(() => setShowIcons(false), [setShowIcons]);

  const { blockUid, windowId } = getUidsFromId(blockId);
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
            <Button
              icon="edit"
              minimal
              onClick={() =>
                window.roamAlphaAPI.ui.setBlockFocusAndSelection({
                  location: { "block-uid": blockUid, "window-id": windowId },
                })
              }
            />
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
  (b: HTMLButtonElement, args?: OnloadArgs): void => {
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
          b.parentElement,
          args
        );
      }
    }
  };

export default ComponentContainer;
