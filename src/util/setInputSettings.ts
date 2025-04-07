import getBasicTreeByParentUid from "../queries/getBasicTreeByParentUid";
import deleteBlock from "../writes/deleteBlock";
import createBlock from "../writes/createBlock";
import toFlexRegex from "./toFlexRegex";

export const setInputSettings = async ({
  blockUid,
  values,
  key,
  index = 0,
}: {
  blockUid: string;
  values: string[];
  key: string;
  index?: number;
}): Promise<void> => {
  const tree = await getBasicTreeByParentUid(blockUid);
  const keyNode = tree.find((t) => toFlexRegex(key).test(t.text));
  if (keyNode) {
    keyNode.children
      .filter(({ text }) => !values.includes(text))
      .forEach(({ uid }) => deleteBlock(uid));
    values.forEach(
      (text, order) =>
        !keyNode.children.some(({ text: c }) => text === c) &&
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
