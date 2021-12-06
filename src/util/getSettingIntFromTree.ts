import type { InputTextNode } from "roam-client";
import toFlexRegex from "./toFlexRegex";

const getSettingIntFromTree = ({
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

export default getSettingIntFromTree;
