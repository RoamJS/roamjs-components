import differenceInMilliseconds from "date-fns/differenceInMilliseconds";
import type { ActionParams } from "../types";
import { render as renderProgressDialog } from "../components/ProgressDialog";
import nanoid from "nanoid";

const actionQueue: {
  id: string;
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
const log = (detail: {
  actionQueueLength?: number;
  timeout?: number;
}): (() => void) | undefined => {
  const element = document.getElementById("roamjs-progress-dialog-root");
  if (element) {
    element.dispatchEvent(new CustomEvent("log", { detail }));
    return undefined;
  } else {
    return renderProgressDialog(detail);
  }
};

const submitActions = (
  actions: Omit<typeof actionQueue[number], "id">[]
): Promise<void> => {
  actionQueue.push(...actions.map((a) => ({ ...a, id: nanoid() })));
  let close: (() => void) | undefined = undefined;
  const processActions = async () => {
    const capacity = ROAM_LIMIT - Object.keys(submittedActions).length;
    actionQueue
      .slice(0, capacity)
      .forEach(({ id }) => (submittedActions[id] = undefined));
    if (capacity > 0) {
      const submitNow = actionQueue.splice(0, capacity);
      await Promise.all(
        submitNow.map((action) => {
          const { params, type, id } = action;
          return window.roamAlphaAPI[type](params)
            .catch((e) => {
              console.error(`Failed action of type ${type} with params:`);
              console.error(params);
              console.error(`Here's the error:`);
              console.error(e);
            })
            .then(() => {
              submittedActions[id] = { action, date: new Date() };
            });
        })
      );
    }
    const submittedActionsEntries = Object.entries(submittedActions).filter(
      ([, v]) => !!v
    );
    if (submittedActionsEntries.length && !nextProcess) {
      const maxDateEntered = new Date(
        submittedActionsEntries
          .map(([, a]) => (a ? a.date.valueOf() : 0))
          .reduce((p, c) => (c > p ? c : p), 0)
      );
      const timeout =
        ROAM_TIMEOUT - differenceInMilliseconds(new Date(), maxDateEntered);
      if (!actionQueue.length) close?.();
      else {
        const rendered = log({
          timeout: Math.ceil(timeout / 1000),
          actionQueueLength: actionQueue.length,
        });
        if (rendered) close = rendered;
        const interval = window.setInterval(() => {
          log({
            timeout: Math.ceil(
              (ROAM_TIMEOUT -
                differenceInMilliseconds(new Date(), maxDateEntered)) /
                1000
            ),
          });
        }, 1000);
        nextProcess = window.setTimeout(() => {
          window.clearInterval(interval);
          submittedActionsEntries.forEach(([k]) => {
            delete submittedActions[k];
          });
          nextProcess = 0;
          processActions();
        }, timeout);
      }
    }
  };
  return processActions();
};

export default submitActions;
