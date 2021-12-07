import { differenceInMilliseconds } from "date-fns";
import type { InputTextNode } from "../types";

type ActionParams = Parameters<typeof window.roamAlphaAPI.createBlock>[0];

const gatherActions = ({
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

const actionQueue: {
  params: ActionParams;
  type:
    | "createBlock"
    | "updateBlock"
    | "deleteBlock"
    | "createPage"
    | "updatePage"
    | "deletePage";
}[] = [];
const submittedActions: { date: Date; action: typeof actionQueue[number] }[] =
  [];
const ROAM_LIMIT = 300;
const ROAM_TIMEOUT = 61000; // One minute, plus an extra second to be safe.
const submitActions = (actions: typeof actionQueue) => {
  actionQueue.push(...actions);
  const processActions = () => {
    if (ROAM_LIMIT > submittedActions.length) {
      const submitNow = actionQueue.splice(
        0,
        ROAM_LIMIT - submittedActions.length
      );
      const submittedNow = submitNow.map((action) => {
        const { params, type } = action;
        try {
          window.roamAlphaAPI[type](params);
        } catch (e) {
          console.error(`Failed action of type ${type} with params:`);
          console.error(params);
          console.error(`Here's the error:`);
          console.error(e);
        }
        return { action, date: new Date() };
      });
      submittedActions.push(...submittedNow);
    }
    const timeout =
      ROAM_TIMEOUT -
      differenceInMilliseconds(new Date(), submittedActions.slice(-1)[0].date);
    if (actionQueue.length)
      console.log(
        `Writing to Roam. Actions left: ${actionQueue.length}. Trying again in: ${timeout}`
      );
    setTimeout(() => {
      const now = new Date();
      const index = submittedActions.findIndex(
        ({ date }) => differenceInMilliseconds(now, date) < ROAM_TIMEOUT
      );
      submittedActions.splice(
        0,
        index < 0 ? ROAM_LIMIT : index
      );
      processActions();
    }, timeout);
  };
  if (!submittedActions.length) processActions();
};

const createBlock = (params: Parameters<typeof gatherActions>[0]): string => {
  const actions = gatherActions(params);
  submitActions(actions.map((params) => ({ params, type: "createBlock" })));
  return actions[0].block?.uid || "";
};

export default createBlock;
