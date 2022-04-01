import React, { useCallback, useState } from "react";
import { Alert, Checkbox, Classes } from "@blueprintjs/core";
import createOverlayRender from "../util/createOverlayRender";
import Markdown from "markdown-to-jsx";
import { createBlock } from "..";

type Props = {
  content: string;
  onConfirm?: () => void;
  confirmText?: string;
  onCancel?: () => void;
  externalLink?: boolean;
  dontShowAgain?: string;
};

const SimpleAlert = ({
  onClose,
  content,
  onConfirm,
  onCancel,
  externalLink,
  confirmText = "Ok",
  dontShowAgain,
}: Props & { onClose: () => void }): React.ReactElement => {
  const alertOnClose = useCallback(
    (confirmed: boolean) => {
      onClose();
      if (!confirmed) onCancel?.();
    },
    [onCancel, onClose]
  );
  const cancelProps = onCancel
    ? {
        cancelButtonText: "Cancel",
        canOutsideClickCancel: true,
        canEscapeKeyCancel: true,
      }
    : {};
  const [checked, setChecked] = useState(false);
  const alerOnConfirm = useCallback(() => {
    (checked && dontShowAgain
      ? createBlock({
          parentUid: dontShowAgain,
          node: { text: "Do not show again" },
        })
      : Promise.resolve()
    ).then(onConfirm);
  }, [onConfirm, checked, dontShowAgain]);
  return (
    <Alert
      isOpen={true}
      onClose={alertOnClose}
      onConfirm={alerOnConfirm}
      confirmButtonText={confirmText}
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
        {dontShowAgain && (
          <Checkbox
            checked={checked}
            label="Don't show again"
            onChange={(e) => setChecked((e.target as HTMLInputElement).checked)}
          />
        )}
      </div>
    </Alert>
  );
};

export const render = createOverlayRender<Props>("simple-alert", SimpleAlert);

export default SimpleAlert;
