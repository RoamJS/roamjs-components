import React from "react";
import ReactDOM from "react-dom";
import getRenderRoot from "./getRenderRoot";

export type RoamOverlayProps<T extends Record<string, unknown>> = {
  onClose: () => void;
} & T;

const createOverlayRender =
  <T extends Record<string, unknown>>(
    id: string,
    Overlay: (props: RoamOverlayProps<T>) => React.ReactElement
  ) =>
  (props: T): (() => void) => {
    const parent = getRenderRoot(id);
    const onClose = () => {
      if (typeof props.onClose === "function") props.onClose();
      ReactDOM.unmountComponentAtNode(parent);
      parent.remove();
    };
    if (!parent.hasAttribute("data-existing")) {
      ReactDOM.render(
        React.createElement(Overlay, {
          ...props,
          onClose,
        }),
        parent
      );
    }
    return onClose;
  };

export default createOverlayRender;
