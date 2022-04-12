import { Dialog } from "@blueprintjs/core";
import React, { useState, useEffect } from "react";
import createOverlayRender from "../util/createOverlayRender";

type Props = {
  actionQueueLength: number;
};

const ProgressDialog = ({
  actionQueueLength: defaultActionQueueLength,
  onClose,
}: {
  onClose: () => void;
} & Props) => {
  const [capacity, setCapacity] = useState("unset");
  const [actionQueueLength, setActionQueueLength] = useState(
    defaultActionQueueLength
  );
  const [submittedActionsLength, setSubmittedActionsLength] = useState("unset");
  const [timeout, setTimeout] = useState("unset");
  useEffect(() => {
    const element = document.getElementById(`roamjs-progress-dialog-root`);
    if (element) {
      element.addEventListener("log", ((e: CustomEvent) => {
        if (typeof e.detail.actionQueueLength !== "undefined")
          setActionQueueLength(e.detail.actionQueueLength);
        if (typeof e.detail.capacity !== "undefined")
          setCapacity(e.detail.capacity);
        if (typeof e.detail.submittedActionsLength !== "undefined")
          setSubmittedActionsLength(e.detail.submittedActionsLength);
        if (typeof e.detail.timeout !== "undefined")
          setTimeout(e.detail.timeout);
      }) as EventListener);
    } else {
      console.log(document.body);
      throw new Error(`Couldn't find roamjs-progress-dialog-root`);
    }
  }, []);
  return (
    <Dialog
      isOpen={true}
      onClose={onClose}
      className={"roamjs-progress-dialog"}
      canOutsideClickClose={false}
      canEscapeKeyClose={false}
      hasBackdrop={false}
    >
      <div style={{ padding: 16 }}>
        <h4>Performing Write actions to Roam...</h4>
        <p>
          <b>Action Queue Length:</b>
          {actionQueueLength}
        </p>
        <p>
          <b>Capacity:</b>
          {capacity}
        </p>
        <p>
          <b>Submitted Actions Length:</b>
          {submittedActionsLength}
        </p>
        <p>
          <b>Timeout</b>
          {timeout}
        </p>
      </div>
    </Dialog>
  );
};

export const render = createOverlayRender<Props>(
  "progress-dialog",
  ProgressDialog
);

export default ProgressDialog;
