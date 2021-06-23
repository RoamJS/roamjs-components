import React from "react";
import { Alert, Classes } from "@blueprintjs/core";
import { createOverlayRender } from "./hooks";

type Props = {
  content: string;
  onConfirm: () => void;
  canCancel?: boolean;
};

const SimpleAlert = ({
  onClose,
  content,
  onConfirm,
  canCancel,
}: {
  onClose: () => void;
} & Props): React.ReactElement => {
  const cancelProps = canCancel
    ? {
        cancelButtonText: "Cancel",
        canOutsideClickCancel: true,
        canEscapeKeyCancel: true,
      }
    : {};
  return (
    <Alert
      isOpen={true}
      onClose={onClose}
      onConfirm={onConfirm}
      {...cancelProps}
    >
      <div className={Classes.ALERT_CONTENTS}>
        {content}
      </div>
    </Alert>
  );
};

export const render = createOverlayRender<Props>("simple-alert", SimpleAlert);

export default SimpleAlert;
