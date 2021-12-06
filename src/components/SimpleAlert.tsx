import React from "react";
import { Alert, Classes } from "@blueprintjs/core";
import { createOverlayRender } from "./hooks";
import Markdown from "markdown-to-jsx";

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
}: Props & { onClose: () => void }): React.ReactElement => {
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
      <div
        className={Classes.ALERT_CONTENTS}
        style={{ whiteSpace: "pre-wrap" }}
      >
        <Markdown>{content}</Markdown>
      </div>
    </Alert>
  );
};

export const render = createOverlayRender<Props>("simple-alert", SimpleAlert);

export default SimpleAlert;
