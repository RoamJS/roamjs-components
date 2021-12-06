import { getTreeByBlockUid, deleteBlock, createBlock } from "roam-client";
import toFlexRegex from "./toFlexRegex";

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

export default setInputSettings;
