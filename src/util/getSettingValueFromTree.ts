import { getBasicTreeByParentUid } from "../queries";
import type { InputTextNode } from "../types";
import toFlexRegex from "./toFlexRegex";

const getSettingValueFromTree = ({
  parentUid = "",
  tree = getBasicTreeByParentUid(parentUid),
  key,
  defaultValue = "",
}: {
  parentUid?: string;
  tree?: InputTextNode[];
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
