import React from "react";
import { createOverlayRender } from "./hooks";
import { Intent, Position, Toast as BPToast, Toaster } from "@blueprintjs/core";

type ToastProps = {
  content: string;
};

const Toast = ({
  content,
  onClose,
}: {
  onClose: () => void;
} & ToastProps): React.ReactElement => {
  return (
    <Toaster position={Position.TOP} canEscapeKeyClear>
      <BPToast intent={Intent.WARNING} onDismiss={onClose} message={content} />
    </Toaster>
  );
};

export const render = ({
  id,
  content,
}: {
  id: string;
} & ToastProps): void =>
  createOverlayRender<ToastProps>(id, Toast)({ content });

export default Toast;
