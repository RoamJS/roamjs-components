import type { ActionParams } from "../types";
import { ID, render as renderProgressDialog } from "../components/ProgressDialog";
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

const ROAM_TIMEOUT = 60000;

const submitActions = (
  actions: Omit<typeof actionQueue[number], "id">[]
): Promise<void> => {
  return Promise.all(
    actions.map(
      (action) =>
        new Promise((resolve, reject) => {
          const { params, type } = action;
          const id = nanoid();
          const fire = () =>
            window.roamAlphaAPI[type](params)
              .then(resolve)
              .catch((e) => {
                if (e.code === "busy") {
                  const detail = {
                    timeout: ROAM_TIMEOUT + new Date().valueOf(),
                    id,
                  };
                  const element = document.getElementById(ID);
                  if (element) {
                    element.dispatchEvent(new CustomEvent("log", { detail }));
                  } else {
                    renderProgressDialog(detail);
                  }
                  setTimeout(fire, 60000);
                } else {
                  reject(e);
                }
              });
          fire();
        })
    )
  ).then(() => Promise.resolve());
};

export default submitActions;
