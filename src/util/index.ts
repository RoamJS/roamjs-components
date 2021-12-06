import axios from "axios";
import { addStyle, BLOCK_REF_REGEX } from "../dom";
import {
  InputTextNode,
} from "../types";

const getCurrentUser = (): string[] => {
  const globalAppState = JSON.parse(
    localStorage.getItem("globalAppState") || '["","",[]]'
  ) as (string | string[])[];
  const userIndex = globalAppState.findIndex((s) => s === "~:user");
  if (userIndex > 0) {
    return globalAppState[userIndex + 1] as string[];
  }
  return [];
};

export const getCurrentUserEmail = (): string => {
  const userArray = getCurrentUser();
  const emailIndex = userArray.findIndex((s) => s === "~:email");
  if (emailIndex > 0) {
    return userArray[emailIndex + 1];
  }
  return "";
};

export const getCurrentUserUid = (): string => {
  const userArray = getCurrentUser();
  const uidIndex = userArray.findIndex((s) => s === "~:uid");
  if (uidIndex > 0) {
    return userArray[uidIndex + 1];
  }
  return "";
};

export const getCurrentUserDisplayName = (): string => {
  const userArray = getCurrentUser();
  const uidIndex = userArray.findIndex((s) => s === "~:display-name");
  if (uidIndex > 0) {
    return userArray[uidIndex + 1] || "";
  }
  return "";
};

export const extractTag = (tag: string): string =>
  tag.startsWith("#[[") && tag.endsWith("]]")
    ? tag.substring(3, tag.length - 2)
    : tag.startsWith("[[") && tag.endsWith("]]")
    ? tag.substring(2, tag.length - 2)
    : tag.startsWith("#")
    ? tag.substring(1)
    : tag.endsWith("::")
    ? tag.substring(0, tag.length - 2)
    : tag;

export const extractRef = (ref: string): string =>
  new RegExp(
    `(?:\\(\\()?${BLOCK_REF_REGEX.source.slice(4, -4)}(?:\\)\\))?`
  ).exec(ref)?.[1] || ref;

export const toConfig = (id: string): string => `roam/js/${id}`;

export const getGraph = (): string =>
  /^#\/app\/([^/]*?)(?:\/page\/.{9,10})?$/.exec(window.location.hash)?.[1] ||
  "";

export const localStorageSet = (key: string, val: string): void =>
  localStorage.setItem(`roamjs:${key}:${getGraph()}`, val);

export const localStorageGet = (key: string): string=>
  localStorage.getItem(`roamjs:${key}:${getGraph()}`) || '';

export const localStorageRemove = (key: string): void =>
  localStorage.removeItem(`roamjs:${key}:${getGraph()}`);

export const runExtension = async (
  extensionId: string,
  run: () => void,
  options: { skipAnalytics?: boolean } = {}
): Promise<void> => {
  if (window.roamjs?.loaded?.has?.(extensionId)) {
    return;
  }
  window.roamjs = {
    loaded: window.roamjs?.loaded || new Set(),
    extension: window.roamjs?.extension || {},
    version: window.roamjs?.version || {},
    dynamicElements: window.roamjs?.dynamicElements || new Set(),
  };
  window.roamjs.loaded.add(extensionId);
  window.roamjs.version[extensionId] = process.env.ROAMJS_VERSION || "";

  if (!options.skipAnalytics) {
    axios.post(`https://api.roamjs.com/mixpanel`, {
      eventName: "Load Extension",
      properties: { extensionId },
    });
  }
  addStyle(
    `.bp3-button:focus {
  outline-width: 2px;
}`,
    "roamjs-default"
  );

  run();
};

type CommandOutput = string | string[] | InputTextNode[];
type CommandHandler = (
  ...args: string[]
) => CommandOutput | Promise<CommandOutput>;
export const registerSmartBlocksCommand = ({
  text: inputText,
  handler,
}: {
  text: string;
  handler: (u: unknown) => CommandHandler;
}): void => {
  const text = inputText.toUpperCase();
  const register = (retry: number): void | number | false =>
    window.roamjs?.extension?.smartblocks?.registerCommand
      ? window.roamjs.extension.smartblocks.registerCommand({
          text,
          handler,
        })
      : retry === 120 && window.roamjs
      ? !(window.roamjs = {
          ...window.roamjs,
          extension: {
            ...window.roamjs.extension,
            [text]: {
              ...window.roamjs.extension[text],
              registerSmartBlocksCommand: () => {
                window.roamjs?.extension.smartblocks.registerCommand({
                  text,
                  handler,
                });
              },
            },
          },
        })
      : window.setTimeout(() => register(retry + 1), 1000);
  register(0);
};

export const createTagRegex = (tag: string): RegExp =>
  new RegExp(`#?\\[\\[${tag}\\]\\]|#${tag}`);
