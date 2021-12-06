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
  (props: T): void => {
    const parent = getRenderRoot(id);
    ReactDOM.render(
      React.createElement(Overlay, {
        ...props,
        onClose: () => {
          if (typeof props.onClose === "function") props.onClose();
          ReactDOM.unmountComponentAtNode(parent);
          parent.remove();
        },
      }),
      parent
    );
  };

export default createOverlayRender;
