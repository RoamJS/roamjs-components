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

const BEFORE_REGEX = /::before\(([\w.-]+)\)$/;

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
} = {}): (() => void) | undefined => {
  const parent = document.createElement("div");
  parent.id = id.replace(/^\d*/, "");
  const pathElement =
    typeof path === "string"
      ? document.querySelector(path.replace(BEFORE_REGEX, ""))
      : path;
  if (pathElement && !pathElement.querySelector(`#${parent.id}`)) {
    const before =
      typeof path === "string" ? BEFORE_REGEX.exec(path)?.[1] : undefined;
    if (!before) {
      pathElement.appendChild(parent);
    } else if (!Number.isNaN(Number(before))) {
      pathElement.insertBefore(parent, pathElement.children[Number(before)]);
    } else if (pathElement.querySelector(before)) {
      pathElement.insertBefore(parent, pathElement.querySelector(before));
    } else {
      return undefined;
    }
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
  return undefined;
};

export default renderOverlay;
