import getBasicTreeByParentUid from "../queries/getBasicTreeByParentUid";
import type { InputTextNode } from "../types";
import toFlexRegex from "./toFlexRegex";

const getSettingValueFromTree = async ({
  parentUid = "",
  tree,
  key,
  defaultValue = "",
}: {
  parentUid?: string;
  tree?: InputTextNode[];
  key: string;
  defaultValue?: string;
}): Promise<string> => {
  // results in type errors via `npx tsc --noEmit`
  // const resolvedTree = tree || (await getBasicTreeByParentUid(parentUid));
  let resolvedTree = tree;
  if (!resolvedTree) resolvedTree = await getBasicTreeByParentUid(parentUid);
  const node = resolvedTree.find((s) => toFlexRegex(key).test(s.text.trim()));
  const value = node?.children?.[0]
    ? node?.children?.[0].text.trim()
    : defaultValue;
  return value;
};

export default getSettingValueFromTree;
