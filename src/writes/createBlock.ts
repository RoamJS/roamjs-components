import type { InputTextNode, ActionParams } from "../types";
import submitActions from "./submitActions";

export const gatherActions = ({
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
}): ActionParams[] => {
  return [
    {
      location: { "parent-uid": parentUid, order },
      block: {
        uid,
        string: text,
        heading,
        "text-align": textAlign,
        "children-view-type": viewType,
        open,
      },
    },
    ...children.flatMap((node, order) =>
      gatherActions({ node, parentUid: uid, order })
    ),
  ];
};

const createBlock = (
  params: Parameters<typeof gatherActions>[0]
): Promise<string> => {
  const actions = gatherActions(params);
  return submitActions(
    actions.map((params) => ({ params, type: "createBlock" }))
  ).then(() => actions[0].block?.uid || "");
};

export default createBlock;
