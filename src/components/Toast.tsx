import React from "react";
import { Intent, Toaster, ToasterPosition } from "@blueprintjs/core";
import Markdown from "markdown-to-jsx";

type ToastProps = {
  id: string;
  content?: string;
  timeout?: number;
  intent?: Intent;
  position?: ToasterPosition;
};

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
      className,
    });
    const toasterRoot = document.querySelector<HTMLDivElement>(
      `.bp3-toast-container.${className}`
    )!;
    toasterRoot.addEventListener("roamjs-toast", ((e: CustomEvent) => {
      const props = e.detail;
      toaster.show(
        {
          message: (
            <Markdown>{props.content || "RoamJS Notification"}</Markdown>
          ),
          intent: Intent.PRIMARY,
          timeout: props.timeout || 5000,
        },
        props.id
      );
    }) as EventListener);
    return () => toaster.dismiss(props.id);
  }
};

export default render;
