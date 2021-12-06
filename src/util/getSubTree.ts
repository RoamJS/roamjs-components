import { getBasicTreeByParentUid } from "../queries";
import { RoamBasicNode } from "../types";
import { createBlock } from "../writes";
import toFlexRegex from "./toFlexRegex";

const getSubTree = ({
  key,
  parentUid,
  order = 0,
  tree = parentUid ? getBasicTreeByParentUid(parentUid) : [],
}: {
  key: string;
  parentUid?: string;
  tree?: RoamBasicNode[];
  order?: number;
}): RoamBasicNode =>
  tree.find((s) => toFlexRegex(key).test(s.text.trim())) || {
    text: "",
    uid: parentUid
      ? createBlock({ node: { text: key }, parentUid, order })
      : "",
    children: [],
  };

export default getSubTree;
