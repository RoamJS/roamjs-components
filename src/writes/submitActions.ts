import { differenceInMilliseconds } from "date-fns";
import type { ActionParams } from "../types";
import { render as renderToast } from "../components/Toast";

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
const submitActions = (actions: typeof actionQueue): Promise<void> => {
  actionQueue.push(...actions);
  let close: (() => void) | undefined = undefined;
  const processActions = async () => {
    if (ROAM_LIMIT > submittedActions.length) {
      const submitNow = actionQueue.splice(
        0,
        ROAM_LIMIT - submittedActions.length
      );
      await Promise.all(
        submitNow.map((action) => {
          const { params, type } = action;
          return window.roamAlphaAPI[type](params)
            .catch((e) => {
              console.error(`Failed action of type ${type} with params:`);
              console.error(params);
              console.error(`Here's the error:`);
              console.error(e);
            })
            .then(() => ({ action, date: new Date() }));
        })
      ).then((a) => submittedActions.push(...a));
    }
    if (submittedActions.length) {
      const timeout =
        ROAM_TIMEOUT -
        differenceInMilliseconds(
          new Date(),
          submittedActions.slice(-1)[0].date
        );
      if (actionQueue.length)
        close = renderToast({
          id: "roamjs-write-action",
          content: `Writing to Roam. Actions left: ${
            actionQueue.length
          }. Trying again in ${timeout / 1000} seconds...`,
          position: "bottom-right",
          timeout: 0,
        });
      else close?.();
      setTimeout(() => {
        const now = new Date();
        const index = submittedActions.findIndex(
          ({ date }) => differenceInMilliseconds(now, date) < ROAM_TIMEOUT
        );
        submittedActions.splice(0, index < 0 ? ROAM_LIMIT : index);
        processActions();
      }, timeout);
    }
  };
  return processActions();
};

export default submitActions;
