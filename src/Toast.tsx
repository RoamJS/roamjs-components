import React from "react";
import { createOverlayRender } from "./hooks";
import { Intent, Position, Toast as BPToast, Toaster } from "@blueprintjs/core";

type ToastProps = {
  content?: React.ReactNode;
  timeout?: number;
  intent?: Intent;
};

const Toast = ({
  content = "RoamJS Toast",
  timeout,
  intent = Intent.PRIMARY,
  onClose,
}: {
  onClose: () => void;
} & ToastProps): React.ReactElement => {
  return (
    <Toaster position={Position.TOP} canEscapeKeyClear>
      <BPToast
        intent={intent}
        onDismiss={onClose}
        message={content}
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
