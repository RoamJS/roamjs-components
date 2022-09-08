import nanoid from "nanoid";
import React from "react";
import ReactDOM from "react-dom";
import dispatchToRegistry from "./dispatchToRegistry";
import removeFromRegistry from "./removeFromRegistry";

export type RoamOverlayProps<
  T extends Record<string, unknown> = Record<string, never>
> = {
  onClose: () => void;
  isOpen: boolean;
} & T;

const renderOverlay = <T extends Record<string, unknown>>({
  id = nanoid(),
  Overlay = (props) => React.createElement("div", props),
  props = {} as T,
  path = "body",
}: {
  id?: string;
  Overlay?: (props: RoamOverlayProps<T>) => React.ReactElement;
  props?: T;
  path?: string | HTMLElement | null;
} = {}): (() => void) | void => {
  const parent = document.createElement("div");
  parent.id = id;
  const pathElement =
    typeof path === "string" ? document.querySelector(path) : path;
  if (pathElement && !pathElement.querySelector(`#${id}`)) {
    pathElement.appendChild(parent);
    const onClose = () => {
      if (typeof props.onClose === "function") props.onClose();
      ReactDOM.unmountComponentAtNode(parent);
      parent.remove();
      removeFromRegistry({
        reactRoots: [parent],
      });
    };
    ReactDOM.render(
      React.createElement(Overlay, {
        ...props,
        isOpen: true,
        onClose,
      }),
      parent
    );
    dispatchToRegistry({
      reactRoots: [parent],
    });
    return onClose;
  }
};

export default renderOverlay;
