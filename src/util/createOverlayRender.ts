import React from "react";
import renderOverlay, { RoamOverlayProps } from "./renderOverlay";

const createOverlayRender =
  <T extends Record<string, unknown>>(
    id: string,
    Overlay: (props: RoamOverlayProps<T>) => React.ReactElement
  ) =>
  (props: T) =>
    renderOverlay<T>({ id, Overlay, props });

export default createOverlayRender;
