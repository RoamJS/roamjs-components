import type { InputTextNode } from "../types";

const updateBlock = ({
  text,
  uid,
  heading,
  textAlign,
  viewType,
  open,
}: { uid: string } & Omit<InputTextNode, "children">): string => {
  window.roamAlphaAPI.updateBlock({
    block: {
      string: text,
      uid,
      heading,
      "text-align": textAlign,
      "children-view-type": viewType,
      open,
    },
  });
  return uid;
};

export default updateBlock;