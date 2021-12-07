import type { InputTextNode } from "../types";

const createBlock = ({
  node: {
    text,
    children = [],
    uid = window.roamAlphaAPI.util.generateUID(),
    heading,
    viewType,
    textAlign,
    open = true,
  },
  parentUid,
  order = 0,
}: {
  node: InputTextNode;
  parentUid: string;
  order?: number;
}): string => {
  window.roamAlphaAPI.createBlock({
    location: { "parent-uid": parentUid, order },
    block: {
      uid,
      string: text,
      heading,
      "text-align": textAlign,
      "children-view-type": viewType,
      open,
    },
  });
  children.forEach((n, o) =>
    createBlock({ node: n, parentUid: uid, order: o })
  );
  if (!open) window.roamAlphaAPI.updateBlock({ block: { uid, open: false } }); // Roam doesn't do this for us yet
  return uid;
};

export default createBlock;
