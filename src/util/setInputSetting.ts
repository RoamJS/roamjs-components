import { getTreeByBlockUid } from "roam-client";
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
}): void => {
  const tree = getTreeByBlockUid(blockUid);
  const keyNode = tree.children.find((t) => toFlexRegex(key).test(t.text));
  if (keyNode && keyNode.children.length) {
    window.roamAlphaAPI.updateBlock({
      block: { uid: keyNode.children[0].uid, string: value },
    });
  } else if (!keyNode) {
    const uid = window.roamAlphaAPI.util.generateUID();
    window.roamAlphaAPI.createBlock({
      location: { "parent-uid": blockUid, order: index },
      block: { string: key, uid },
    });
    window.roamAlphaAPI.createBlock({
      location: { "parent-uid": uid, order: 0 },
      block: { string: value },
    });
  } else {
    window.roamAlphaAPI.createBlock({
      location: { "parent-uid": keyNode.uid, order: 0 },
      block: { string: value },
    });
  }
};

export default setInputSetting;
