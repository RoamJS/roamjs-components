import { differenceInMilliseconds } from "date-fns";
import type { ActionParams } from "../types";
import { render as renderToast } from "../components/Toast";
import { v4 } from "uuid";

const actionQueue: {
  uuid: string;
  params: ActionParams;
  type:
    | "createBlock"
    | "updateBlock"
    | "deleteBlock"
    | "createPage"
    | "updatePage"
    | "deletePage";
}[] = [];
const submittedActions: Record<
  string,
  { date: Date; action: typeof actionQueue[number] } | undefined
> = {};
let nextProcess = 0;
const ROAM_LIMIT = 300;
const ROAM_TIMEOUT = 61000; // One minute, plus an extra second to be safe.
const submitActions = (
  actions: Omit<typeof actionQueue[number], "uuid">[]
): Promise<void> => {
  actionQueue.push(...actions.map((a) => ({ ...a, uuid: v4() })));
  let close: (() => void) | undefined = undefined;
  const processActions = async () => {
    const capacity = ROAM_LIMIT - Object.keys(submittedActions).length;
    actionQueue
      .slice(0, capacity)
      .forEach(({ uuid }) => (submittedActions[uuid] = undefined));
    if (capacity > 0) {
      const submitNow = actionQueue.splice(0, capacity);
      await Promise.all(
        submitNow.map((action) => {
          const { params, type, uuid } = action;
          return window.roamAlphaAPI[type](params)
            .catch((e) => {
              console.error(`Failed action of type ${type} with params:`);
              console.error(params);
              console.error(`Here's the error:`);
              console.error(e);
            })
            .then(() => {
              submittedActions[uuid] = { action, date: new Date() };
            });
        })
      );
    }
    const actionEntries= Object.entries(submittedActions);
    if (actionEntries.length && !nextProcess) {
      const timeout =
        ROAM_TIMEOUT -
        differenceInMilliseconds(
          new Date(),
          new Date(
            actionEntries
              .map(([,a]) => (a ? a.date.valueOf() : 0))
              .reduce((p, c) => (c > p ? c : p), 0)
          )
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
      nextProcess = window.setTimeout(() => {
        const now = new Date();
        actionEntries.forEach(([k, action]) => {
          if (
            action &&
            differenceInMilliseconds(now, action.date) > (ROAM_TIMEOUT - 1000)
          )
            delete submittedActions[k];
        });
        nextProcess = 0;
        processActions();
      }, timeout);
    }
  };
  return processActions();
};

export default submitActions;
