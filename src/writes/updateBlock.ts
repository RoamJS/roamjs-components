import type { InputTextNode } from "../types";
import submitActions from "./submitActions";

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
          open,
        },
      },
    },
  ]).then(() => uid);
};

export default updateBlock;
