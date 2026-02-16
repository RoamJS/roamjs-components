import type { InputTextNode } from "../types";
import submitActions from "./submitActions";

const updateBlock = ({
  text,
  uid,
  heading,
  textAlign,
  viewType,
  blockViewType,
  open,
  props,
}: { uid: string } & Partial<
  Omit<InputTextNode, "children">
>): Promise<string> => {
  return submitActions([
    {
      type: "updateBlock",
      params: {
        block: {
          string: text,
          uid,
          heading,
          "text-align": textAlign,
          "children-view-type": viewType,
          "view-type": blockViewType,
          open,
          props,
        },
      },
    },
  ]).then(() => uid);
};

export default updateBlock;
