import type { InputTextNode } from "roam-client";
import toFlexRegex from "./toFlexRegex";

const getSettingValueFromTree = ({
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

export default getSettingValueFromTree;
