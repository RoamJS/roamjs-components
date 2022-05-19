import type { RoamBasicNode } from "../types/native";
import getSettingValueFromTree from "../util/getSettingValueFromTree";

const addKeybordTriggers = ({
  triggers: inputTriggers,
}: {
  triggers: {
    trigger:
      | RegExp
      | (() => RegExp)
      | { tree: RoamBasicNode[]; defaultValue?: string };
    callback: () => void;
  }[];
}) => {
  const triggers = inputTriggers.map(({ trigger, callback }) => {
    if (trigger instanceof RegExp) {
      return { trigger, callback };
    } else if (typeof trigger === "function") {
      return { callback, trigger: trigger() };
    } else {
      const triggerValue = getSettingValueFromTree({
        tree: trigger.tree,
        key: "trigger",
        defaultValue: trigger.defaultValue || "\\\\",
      })
        .replace(/"/g, "")
        .replace(/\\/g, "\\\\")
        .replace(/\+/g, "\\+")
        .trim();

      const triggerRegex = new RegExp(`${triggerValue}$`);
      return { callback, trigger: triggerRegex };
    }
  });

  document.addEventListener("input", (e) => {
    const target = e.target as HTMLElement;
    if (
      target.tagName === "TEXTAREA" &&
      target.classList.contains("rm-block-input")
    ) {
      const textarea = target as HTMLTextAreaElement;
      const valueToCursor = textarea.value.substring(
        0,
        textarea.selectionStart
      );
      triggers.find((args) => args.trigger.test(valueToCursor))?.callback?.();
    }
  });
};

export default addKeybordTriggers;
