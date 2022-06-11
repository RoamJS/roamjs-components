import getBasicTreeByParentUid from "../queries/getBasicTreeByParentUid";
import createBlock from "../writes/createBlock";
import toFlexRegex from "./toFlexRegex";

const addInputSetting = ({
  blockUid,
  value,
  key,
  index = 0,
}: {
  blockUid: string;
  value: string;
  key: string;
  index?: number;
}): Promise<string> => {
  const tree = getBasicTreeByParentUid(blockUid);
  const keyNode = tree.find((t) => toFlexRegex(key).test(t.text));
  if (keyNode) {
    return createBlock({
      node: { text: value },
      order: keyNode.children.length,
      parentUid: keyNode.uid,
    });
  } else {
    return createBlock({
      parentUid: blockUid,
      order: index,
      node: { text: key, children: [{ text: value }] },
    });
  }
};

export default addInputSetting;
