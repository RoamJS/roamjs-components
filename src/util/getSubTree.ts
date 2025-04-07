import getBasicTreeByParentUid from "../queries/getBasicTreeByParentUid";
import type { RoamBasicNode } from "../types/native";
import createBlock from "../writes/createBlock";
import toFlexRegex from "./toFlexRegex";

const getSubTree = async ({
  key,
  parentUid,
  order = 0,
  tree,
}: {
  key: string;
  parentUid?: string;
  tree?: RoamBasicNode[];
  order?: number;
}): Promise<RoamBasicNode> => {
  const resolvedTree =
    tree || (parentUid ? await getBasicTreeByParentUid(parentUid) : []);
  const node = resolvedTree.find((s) => toFlexRegex(key).test(s.text.trim()));
  if (node) return node;
  const defaultNode = { text: "", children: [] };
  if (parentUid) {
    const uid = window.roamAlphaAPI.util.generateUID();
    await createBlock({ node: { text: key, uid }, parentUid, order });
    return {
      uid,
      ...defaultNode,
    };
  }
  return { uid: "", ...defaultNode };
};

export default getSubTree;
