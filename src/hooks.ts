import React from "react";
import { useCallback, useState } from "react";
import ReactDOM from "react-dom";
import {
  createBlock,
  deleteBlock,
  getEditTimeByBlockUid,
  getPageUidByPageTitle,
  getShallowTreeByParentUid,
  getTreeByBlockUid,
  InputTextNode,
  localStorageGet,
  toConfig,
} from "roam-client";

// getting a  __rest is not a function error. Not sure why
export const restOp = (
  rr: Record<string, unknown>,
  omit: string[]
): Record<string, unknown> =>
  Object.fromEntries(
    Object.keys(rr)
      .filter((k) => !omit.includes(k))
      .map((k) => [k, rr[k]])
  );

export const toTitle = (id: string): string =>
  id
    .split("-")
    .map((s) => `${s.substring(0, 1).toUpperCase()}${s.substring(1)}`)
    .join(" ")
    .replace(/_/g, " ");

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
        }
      }
      if (e.key === "Enter") {
        onEnter(results[activeIndex]);
        setActiveIndex(0);
        e.preventDefault();
        e.stopPropagation();
      }
    },
    [activeIndex, setActiveIndex, results, onEnter]
  );
  return {
    activeIndex,
    onKeyDown,
  };
};

export type RoamOverlayProps<T extends Record<string, unknown>> = {
  onClose: () => void;
} & T;

export const createOverlayRender =
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
          ReactDOM.unmountComponentAtNode(parent);
          parent.remove();
        },
      }),
      parent
    );
  };

export const toFlexRegex = (key: string): RegExp =>
  new RegExp(`^\\s*${key}\\s*(#\\.[\\w\\d-]*\\s*)?$`, "i");

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
  tree: InputTextNode[];
  key: string;
  defaultValue?: string;
}): string => {
  const node = tree.find((s) => toFlexRegex(key).test(s.text.trim()));
  const value = node?.children?.[0]
    ? node?.children?.[0].text.trim()
    : defaultValue;
  return value;
};

export const getSettingIntFromTree = ({
  tree,
  key,
  defaultValue = 0,
}: {
  tree: InputTextNode[];
  key: string;
  defaultValue?: number;
}): number => {
  const node = tree.find((s) => toFlexRegex(key).test(s.text.trim()));
  const value = node?.children?.[0]?.text?.trim?.() || "";
  return !value || isNaN(Number(value)) ? defaultValue : Number(value);
};

export const getSettingValuesFromTree = ({
  tree,
  key,
  defaultValue = [],
}: {
  tree: InputTextNode[];
  key: string;
  defaultValue?: string[];
}): string[] => {
  const node = tree.find((s) => toFlexRegex(key).test(s.text.trim()));
  const value = node?.children ? node.children.map((t) => t.text.trim()) : defaultValue;
  return value;
};

export const getOauthAccounts = (service: string): string[] => {
  const fromStorage = localStorageGet(`oauth-${service}`);
  if (fromStorage) {
    const accounts = JSON.parse(fromStorage) as {
      text: string;
      data: string;
    }[];
    return accounts.map((a) => a.text);
  }
  const tree = getShallowTreeByParentUid(
    getPageUidByPageTitle(toConfig(service))
  );
  const node = tree.find((s) => toFlexRegex("oauth").test(s.text.trim()));
  if (!node) {
    return [];
  }
  return getShallowTreeByParentUid(node.uid).map((t) => t.text);
};

export const getOauth = (service: string, label?: string): string => {
  const fromStorage = localStorageGet(`oauth-${service}`);
  if (fromStorage) {
    const accounts = JSON.parse(fromStorage) as {
      text: string;
      data: string;
    }[];
    const accountNode =
      (label ? accounts.find(({ text }) => text === label) : accounts[0]) ||
      ({} as { data?: string });
    const data = accountNode.data;
    const node = restOp(accountNode, ["data"]);
    return data ? JSON.stringify({ ...JSON.parse(data), node }) : "{}";
  }
  const tree = getShallowTreeByParentUid(
    getPageUidByPageTitle(toConfig(service))
  );
  const node = tree.find((s) => toFlexRegex("oauth").test(s.text.trim()));
  if (!node) {
    return "{}";
  }
  const nodeChildren = getShallowTreeByParentUid(node.uid);
  const index = label
    ? nodeChildren.findIndex((t) => toFlexRegex(label).test(t.text))
    : 0;
  const labelNode = nodeChildren[index];
  if (!labelNode) {
    return "{}";
  }
  if (labelNode.text.startsWith("{") && labelNode.text.endsWith("}")) {
    const obj = JSON.parse(labelNode.text);
    obj.node = {
      uid: labelNode.uid,
      time: getEditTimeByBlockUid(labelNode.uid),
    };
    return JSON.stringify(obj);
  }
  const dataNode = getShallowTreeByParentUid(labelNode.uid)[0];
  const uid = dataNode?.uid || "";
  if (!dataNode?.text) {
    return "{}";
  }
  const obj = JSON.parse(dataNode.text);
  obj.node = {
    uid,
    time: uid ? getEditTimeByBlockUid(uid) : 0,
  };
  return JSON.stringify(obj);
};

export const renderWithUnmount = (
  el: React.ReactElement,
  p: HTMLElement
): void => {
  ReactDOM.render(el, p);
  const unmountObserver = new MutationObserver((ms) => {
    const parentRemoved = ms
      .flatMap((m) => Array.from(m.removedNodes))
      .some((n) => n === p || n.contains(p));
    if (parentRemoved) {
      unmountObserver.disconnect();
      ReactDOM.unmountComponentAtNode(p);
    }
  });
  unmountObserver.observe(document.body, { childList: true, subtree: true });
};

export const setInputSetting = ({
  blockUid,
  value,
  key,
  index = 0,
}: {
  blockUid: string;
  value: string;
  key: string;
  index?: number;
}): void => {
  const tree = getTreeByBlockUid(blockUid);
  const keyNode = tree.children.find((t) => toFlexRegex(key).test(t.text));
  if (keyNode && keyNode.children.length) {
    window.roamAlphaAPI.updateBlock({
      block: { uid: keyNode.children[0].uid, string: value },
    });
  } else if (!keyNode) {
    const uid = window.roamAlphaAPI.util.generateUID();
    window.roamAlphaAPI.createBlock({
      location: { "parent-uid": blockUid, order: index },
      block: { string: key, uid },
    });
    window.roamAlphaAPI.createBlock({
      location: { "parent-uid": uid, order: 0 },
      block: { string: value },
    });
  } else {
    window.roamAlphaAPI.createBlock({
      location: { "parent-uid": keyNode.uid, order: 0 },
      block: { string: value },
    });
  }
};

export const setInputSettings = ({
  blockUid,
  values,
  key,
  index = 0,
}: {
  blockUid: string;
  values: string[];
  key: string;
  index?: number;
}): void => {
  const tree = getTreeByBlockUid(blockUid);
  const keyNode = tree.children.find((t) => toFlexRegex(key).test(t.text));
  if (keyNode) {
    keyNode.children
      .filter(({ text }) => !values.includes(text))
      .forEach(({ uid }) => deleteBlock(uid));
    values
      .filter((v) => !keyNode.children.some(({ text }) => text === v))
      .forEach((text, order) =>
        createBlock({ node: { text }, order, parentUid: keyNode.uid })
      );
  } else {
    createBlock({
      parentUid: blockUid,
      order: index,
      node: { text: key, children: values.map((text) => ({ text })) },
    });
  }
};

export const addInputSetting = ({
  blockUid,
  value,
  key,
  index = 0,
}: {
  blockUid: string;
  value: string;
  key: string;
  index?: number;
}): string => {
  const tree = getTreeByBlockUid(blockUid);
  const keyNode = tree.children.find((t) => toFlexRegex(key).test(t.text));
  if (keyNode) {
    return createBlock({
      node: { text: value },
      order: keyNode.children.length,
      parentUid: keyNode.uid,
    });
  } else {
    return createBlock({
      parentUid: blockUid,
      order: index,
      node: { text: key, children: [{ text: value }] },
    });
  }
};
