import { differenceInMilliseconds } from "date-fns";
import type { ActionParams } from "../types";
import { render as renderProgressDialog } from "../components/ProgressDialog";
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
const log = (detail: Record<string, string | number>) => {
  const element = document.getElementById("roamjs-progress-dialog-root");
  if (element) {
    element.dispatchEvent(new CustomEvent("log", { detail }));
  }
};

const submitActions = (
  actions: Omit<typeof actionQueue[number], "uuid">[]
): Promise<void> => {
  actionQueue.push(...actions.map((a) => ({ ...a, uuid: v4() })));
  let close: (() => void) | undefined = renderProgressDialog({
    actionQueueLength: actionQueue.length,
  }); // undefined;
  log({
    actionQueueLength: actionQueue.length,
  });
  const processActions = async () => {
    const capacity = ROAM_LIMIT - Object.keys(submittedActions).length;
    actionQueue
      .slice(0, capacity)
      .forEach(({ uuid }) => (submittedActions[uuid] = undefined));
    log({
      capacity,
      submittedActionsLength: Object.keys(submittedActions).length,
    });
    if (capacity > 0) {
      const submitNow = actionQueue.splice(0, capacity);
      log({ actionQueueLength: actionQueue.length });
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
    const actionEntries = Object.entries(submittedActions);
    if (actionEntries.length && !nextProcess) {
      const maxDateEntered = new Date(
        actionEntries
          .map(([, a]) => (a ? a.date.valueOf() : 0))
          .reduce((p, c) => (c > p ? c : p), 0)
      );
      const timeout =
        ROAM_TIMEOUT - differenceInMilliseconds(new Date(), maxDateEntered);
      log({ timeout });
      if (!actionQueue.length) close?.();
      const interval = window.setInterval(() => {
        log({
          timeout:
            ROAM_TIMEOUT - differenceInMilliseconds(new Date(), maxDateEntered),
        });
      }, 1000);
      nextProcess = window.setTimeout(() => {
        window.clearInterval(interval);
        const now = new Date();
        actionEntries.forEach(([k, action]) => {
          if (
            action &&
            differenceInMilliseconds(now, action.date) > ROAM_TIMEOUT - 1000
          )
            delete submittedActions[k];
        });
        log({ submittedActionsLength: Object.keys(submittedActions).length });
        nextProcess = 0;
        processActions();
      }, timeout);
    }
  };
  return processActions();
};

export default submitActions;
