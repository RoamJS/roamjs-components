import type { InputTextNode } from "../types";

const updateBlock = ({
  text,
  uid,
  heading,
  textAlign,
  viewType,
  open,
}: { uid: string } & Partial<
  Omit<InputTextNode, "children">
>): Promise<string> => {
  return window.roamAlphaAPI
    .updateBlock({
      block: {
        string: text,
        uid,
        heading,
        "text-align": textAlign,
        "children-view-type": viewType,
        open,
      },
    })
    .then(() => uid);
};

export default updateBlock;
