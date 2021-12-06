import type { InputTextNode } from "roam-client";
import toFlexRegex from "./toFlexRegex";

const getSettingValuesFromTree = ({
  tree,
  key,
  defaultValue = [],
}: {
  tree: InputTextNode[];
  key: string;
  defaultValue?: string[];
}): string[] => {
  const node = tree.find((s) => toFlexRegex(key).test(s.text.trim()));
  const value = node?.children
    ? node.children.map((t) => t.text.trim())
    : defaultValue;
  return value;
};

export default getSettingValuesFromTree;
