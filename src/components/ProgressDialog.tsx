import { Dialog } from "@blueprintjs/core";
import React, { useState, useEffect } from "react";
import createOverlayRender from "../util/createOverlayRender";

type Props = {
  actionQueueLength?: number;
  timeout?: number;
};

const ProgressDialog = ({
  actionQueueLength: defaultActionQueueLength,
  timeout: defaultTimeout,
  onClose,
}: {
  onClose: () => void;
} & Props) => {
  const [actionQueueLength, setActionQueueLength] = useState(
    defaultActionQueueLength || 0
  );
  const [timeout, setTimeout] = useState(defaultTimeout || 60);
  useEffect(() => {
    const element = document.getElementById(`roamjs-progress-dialog-root`);
    if (element) {
      element.addEventListener("log", ((e: CustomEvent) => {
        if (typeof e.detail.actionQueueLength !== "undefined")
          setActionQueueLength(e.detail.actionQueueLength);
        if (typeof e.detail.timeout !== "undefined")
          setTimeout(e.detail.timeout);
      }) as EventListener);
    } else {
      console.log(document.body);
      throw new Error(`Couldn't find roamjs-progress-dialog-root`);
    }
  }, [setActionQueueLength, setTimeout]);
  return (
    <>
      <style>{`.roamjs-progress-dialog {
  right: 8px;
  margin: 0;
  position: absolute;
  bottom: 8px;
}
.roamjs-progress-dialog-portal .bp3-dialog-container,
.roamjs-progress-dialog-portal .bp3-overlay {
  pointer-events: none;
}
.roamjs-progress-dialog-portal .bp3-overlay-backdrop {
  display: none;
}`}</style>
      <Dialog
        isOpen={true}
        onClose={onClose}
        portalClassName={"roamjs-progress-dialog-portal"}
        className={"roamjs-progress-dialog"}
        canOutsideClickClose={false}
        canEscapeKeyClose={false}
        hasBackdrop={false}
        enforceFocus={false}
      >
        <div style={{ padding: 16 }}>
          <h4>Performing Write actions to Roam...</h4>
          <p>Roam only allows 300 writes per minute, waiting to finish.</p>
          <p>
            Still have <b>{actionQueueLength}</b> actions to write in{" "}
            <b>{timeout}</b> seconds...
          </p>
        </div>
      </Dialog>
    </>
  );
};

export const render = createOverlayRender<Props>(
  "progress-dialog",
  ProgressDialog
);

export default ProgressDialog;
