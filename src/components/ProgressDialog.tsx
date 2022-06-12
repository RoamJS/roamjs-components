import { Dialog } from "@blueprintjs/core";
import React, { useState, useEffect, useCallback } from "react";
import createOverlayRender from "../util/createOverlayRender";

type Props = {
  id: string;
  timeout: number;
};

export const ID = "roamjs-progress-dialog-root";

const ProgressDialog = ({
  onClose,
  ...props
}: {
  onClose: () => void;
} & Props) => {
  const [maxTimeout, setMaxtimeout] = useState(props.timeout);
  const [now, setNow] = useState(new Date());
  const onId = useCallback(
    (props: Props) => {
      window.roamjs.actions[props.id] = props.timeout;
      setMaxtimeout(props.timeout);
    },
    [setMaxtimeout]
  );
  useEffect(() => {
    const element = document.getElementById(ID);
    if (element) {
      element.addEventListener("log", ((e: CustomEvent) => {
        onId(e.detail as Props);
      }) as EventListener);
      onId(props);
    }
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, [onId, setTimeout, props]);
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
          <h4>Performing Writes to Roam...</h4>
          <p>
            Still have <b>{Object.keys(window.roamjs.actions).length}</b>{" "}
            actions to write. Expected to finish the last one in{" "}
            {Math.ceil((maxTimeout - now.valueOf()) / 1000)} seconds...
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
