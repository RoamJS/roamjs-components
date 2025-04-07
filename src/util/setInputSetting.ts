import getBasicTreeByParentUid from "../queries/getBasicTreeByParentUid";
import createBlock from "../writes/createBlock";
import updateBlock from "../writes/updateBlock";
import toFlexRegex from "./toFlexRegex";

const setInputSetting = async ({
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
  const tree = await getBasicTreeByParentUid(blockUid);
  const keyNode = tree.find((t) => toFlexRegex(key).test(t.text));
  if (keyNode && keyNode.children.length) {
    return updateBlock({
      uid: keyNode.children[0].uid,
      text: value,
    });
  } else if (!keyNode) {
    const uid = window.roamAlphaAPI.util.generateUID();
    return createBlock({
      parentUid: blockUid,
      order: index,
      node: { text: key, uid },
    }).then(() =>
      createBlock({
        parentUid: uid,
        order: 0,
        node: { text: value },
      })
    );
  } else {
    return createBlock({
      parentUid: keyNode.uid,
      order: 0,
      node: { text: value },
    });
  }
};

export default setInputSetting;
