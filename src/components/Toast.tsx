import React from "react";
import {
  Intent,
  IToastProps,
  Toaster,
  ToasterPosition,
} from "@blueprintjs/core";

type ToastBaseProps = {
  content?: string;
  timeout?: number;
  intent?: Intent;
  onDismiss?: IToastProps["onDismiss"];
  action?: IToastProps['action'];
};

type ToastProps = {
  id: string;
  position?: ToasterPosition;
} & ToastBaseProps;

export const render = ({
  position = "top",
  ...props
}: ToastProps): (() => void) => {
  const className = `roamjs-toast-${position}`;
  const toasterRoot = document.querySelector(
    `.bp3-toast-container.${className}`
  );
  if (toasterRoot) {
    toasterRoot.dispatchEvent(
      new CustomEvent("roamjs-toast", { detail: props })
    );
    return () => toasterRoot.remove();
  } else {
    const toaster = Toaster.create({
      position,
      className,
    });

    // `import(marked-react)` is returning `window.RoamLazy.MarkedReact` instead of the module itself
    (window.RoamLazy
      ? window.RoamLazy.MarkedReact()
      : import("marked-react").then((r) => r.default)
    ).then((Markdown) => {
      const Toast = ({
        content = "RoamJS Notification",
        intent = Intent.PRIMARY,
        timeout = 5000,
        onDismiss,
        action,
      }: ToastBaseProps) => {
        return {
          message: (
            <>
              <style>{`.${className} p { margin-bottom: 0; }`}</style>
              <Markdown>{content}</Markdown>
            </>
          ),
          intent,
          timeout,
          onDismiss,
          action,
        };
      };
      toaster.show(Toast(props), props.id);
      setTimeout(() => {
        const toasterRoot = document.querySelector<HTMLDivElement>(
          `.bp3-toast-container.${className}`
        );
        if (toasterRoot)
          toasterRoot.addEventListener("roamjs-toast", ((e: CustomEvent) => {
            const {
              detail: { id, ...props },
            } = e;
            toaster.show(Toast(props), id);
          }) as EventListener);
      }, 1);
    });
    return () => toaster.dismiss(props.id);
  }
};

export default render;
