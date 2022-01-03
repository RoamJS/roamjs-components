import getBasicTreeByParentUid from "../queries/getBasicTreeByParentUid";
import toFlexRegex from "./toFlexRegex";

const setInputSetting = ({
  blockUid,
  value,
  key,
  index = 0,
}: {
  blockUid: string;
  value: string;
  key: string;
  index?: number;
}): Promise<void> => {
  const tree = getBasicTreeByParentUid(blockUid);
  const keyNode = tree.find((t) => toFlexRegex(key).test(t.text));
  if (keyNode && keyNode.children.length) {
    return window.roamAlphaAPI.updateBlock({
      block: { uid: keyNode.children[0].uid, string: value },
    });
  } else if (!keyNode) {
    const uid = window.roamAlphaAPI.util.generateUID();
    return window.roamAlphaAPI
      .createBlock({
        location: { "parent-uid": blockUid, order: index },
        block: { string: key, uid },
      })
      .then(() =>
        window.roamAlphaAPI.createBlock({
          location: { "parent-uid": uid, order: 0 },
          block: { string: value },
        })
      );
  } else {
    return window.roamAlphaAPI.createBlock({
      location: { "parent-uid": keyNode.uid, order: 0 },
      block: { string: value },
    });
  }
};

export default setInputSetting;
