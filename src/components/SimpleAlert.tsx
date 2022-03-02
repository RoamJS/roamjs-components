import React from "react";
import { Alert, Classes } from "@blueprintjs/core";
import createOverlayRender from "../util/createOverlayRender";
import Markdown from "markdown-to-jsx";

type Props = {
  content: string;
  onConfirm: () => void;
  canCancel?: boolean;
  externalLink?: boolean;
};

const SimpleAlert = ({
  onClose,
  content,
  onConfirm,
  canCancel,
  externalLink,
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
