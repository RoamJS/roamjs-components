import React from "react";
import { createOverlayRender } from "./hooks";
import { Intent, Toast as BPToast, Toaster, ToasterPosition } from "@blueprintjs/core";
import Markdown from "markdown-to-jsx";

type ToastProps = {
  content?: string;
  timeout?: number;
  intent?: Intent;
  position?: ToasterPosition;
};

const Toast = ({
  content = "RoamJS Toast",
  timeout,
  intent = Intent.PRIMARY,
  position = 'top',
  onClose,
}: {
  onClose: () => void;
} & ToastProps): React.ReactElement => {
  return (
    <Toaster position={position} canEscapeKeyClear>
      <BPToast
        intent={intent}
        onDismiss={onClose}
        message={<Markdown>{content}</Markdown>}
        timeout={timeout}
      />
    </Toaster>
  );
};

export const render = ({
  id,
  ...props
}: {
  id: string;
} & ToastProps): void => createOverlayRender<ToastProps>(id, Toast)(props);

export default Toast;
