import React from "react";
import { Alert, Classes } from "@blueprintjs/core";
import { createOverlayRender } from "./hooks";

type Props = {
  content: string;
  onConfirm: () => void;
};

const SimpleAlert = ({
  onClose,
  content,
  onConfirm,
}: {
  onClose: () => void;
} & Props): React.ReactElement => {
  return (
    <Alert isOpen={true} onClose={onClose} onConfirm={onConfirm}>
      <div className={Classes.ALERT_BODY}>{content}</div>
    </Alert>
  );
};

export const render = createOverlayRender<Props>("simple-alert", SimpleAlert);

export default SimpleAlert;
