import React, { useCallback } from "react";
import { Alert, Classes } from "@blueprintjs/core";
import createOverlayRender from "../util/createOverlayRender";
import Markdown from "markdown-to-jsx";

type Props = {
  content: string;
  onConfirm: () => void;
  onCancel?: () => void;
  externalLink?: boolean;
};

const SimpleAlert = ({
  onClose,
  content,
  onConfirm,
  onCancel,
  externalLink,
}: Props & { onClose: () => void }): React.ReactElement => {
  const alertOnClose = useCallback(() => {
    onClose();
    onCancel?.();
  }, [onCancel, onClose]);
  const cancelProps = onCancel
    ? {
        cancelButtonText: "Cancel",
        canOutsideClickCancel: true,
        canEscapeKeyCancel: true,
      }
    : {};
  return (
    <Alert
      isOpen={true}
      onClose={alertOnClose}
      onConfirm={onConfirm}
      {...cancelProps}
    >
      <div
        className={Classes.ALERT_CONTENTS}
        style={{ whiteSpace: "pre-wrap" }}
      >
        <Markdown
          options={{
            overrides: {
              a: {
                props: externalLink
                  ? {
                      target: "_blank",
                      rel: "nooperner",
                    }
                  : {},
              },
            },
          }}
        >
          {content}
        </Markdown>
      </div>
    </Alert>
  );
};

export const render = createOverlayRender<Props>("simple-alert", SimpleAlert);

export default SimpleAlert;
