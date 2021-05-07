import React from "react";
import { useCallback, useState } from "react";
import ReactDOM from "react-dom";
import { TextNode } from "roam-client";

export const toTitle = (id: string): string =>
  id
    .split("-")
    .map((s) => `${s.substring(0, 1).toUpperCase()}${s.substring(1)}`)
    .join(" ");

export const useArrowKeyDown = <T>({
  results,
  onEnter,
}: {
  results: T[];
  onEnter: (i: T) => void;
}): {
  activeIndex: number;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
} => {
  const [activeIndex, setActiveIndex] = useState(0);
  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (results.length > 0) {
        if (e.key === "ArrowDown") {
          setActiveIndex((activeIndex + 1) % results.length);
          e.preventDefault();
          e.stopPropagation();
        } else if (e.key === "ArrowUp") {
          setActiveIndex((activeIndex + results.length - 1) % results.length);
          e.preventDefault();
          e.stopPropagation();
        } else if (e.key === "Enter") {
          onEnter(results[activeIndex]);
          setActiveIndex(0);
          e.preventDefault();
          e.stopPropagation();
        }
      }
    },
    [activeIndex, setActiveIndex, results, onEnter]
  );
  return {
    activeIndex,
    onKeyDown,
  };
};

export const createOverlayRender = <T extends Record<string, unknown>>(
  id: string,
  Overlay: (props: { onClose: () => void } & T) => React.ReactElement
) => (props: T): void => {
  const parent = getRenderRoot(id);
  ReactDOM.render(
    React.createElement(Overlay, {
      ...props,
      onClose: () => {
        ReactDOM.unmountComponentAtNode(parent);
        parent.remove();
      },
    }),
    parent
  );
};

const toFlexRegex = (key: string): RegExp =>
  new RegExp(`^\\s*${key}\\s*$`, "i");

export const getRenderRoot = (id: string): HTMLDivElement => {
  const app = document.getElementById("app");
  const newRoot = document.createElement("div");
  newRoot.id = `roamjs-${id}-root`;
  app?.parentElement?.appendChild(newRoot);
  return newRoot;
};

export const getSettingValueFromTree = ({
  tree,
  key,
  defaultValue = "",
}: {
  tree: TextNode[];
  key: string;
  defaultValue?: string;
}): string => {
  const node = tree.find((s) => toFlexRegex(key).test(s.text.trim()));
  const value = node ? node.children[0].text.trim() : defaultValue;
  return value;
};

export const getSettingIntFromTree = ({
  tree,
  key,
  defaultValue = 0,
}: {
  tree: TextNode[];
  key: string;
  defaultValue?: number;
}): number => {
  const node = tree.find((s) => toFlexRegex(key).test(s.text.trim()));
  const value = node?.children?.[0]?.text?.trim?.() || "";
  return isNaN(Number(value)) ? defaultValue : parseInt(value);
};

export const getSettingValuesFromTree = ({
  tree,
  key,
  defaultValue = [],
}: {
  tree: TextNode[];
  key: string;
  defaultValue?: string[];
}): string[] => {
  const node = tree.find((s) => toFlexRegex(key).test(s.text.trim()));
  const value = node ? node.children.map((t) => t.text.trim()) : defaultValue;
  return value;
};

export const renderWithUnmount = (
  el: React.ReactElement,
  p: HTMLElement
): void => {
  ReactDOM.render(el, p);
  const unmountObserver = new MutationObserver((ms) => {
    const parentRemoved = ms
      .flatMap((m) => Array.from(m.removedNodes))
      .some((n) => n.parentElement?.contains(p));
    if (parentRemoved) {
      unmountObserver.disconnect();
      ReactDOM.unmountComponentAtNode(p);
    }
  });
  unmountObserver.observe(document.body, { childList: true, subtree: true });
};
