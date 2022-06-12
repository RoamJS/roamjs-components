import * as components from "./components/index";
import * as date from "./date";
import * as dom from "./dom";
import * as events from "./events";
import * as hooks from "./hooks";
import * as marked from "./marked";
import * as queries from "./queries";
import * as types from "./types";
import * as util from "./util";
import * as writes from "./writes";

export default {
  onload: () => {
    window.roamjs = window.roamjs || {
      extension: {},
      version: {},
      loaded: new Set(["components"]),
      actions: {},
    };

    window.roamjs.extension.components = {
      components,
      date,
      dom,
      events,
      hooks,
      marked,
      queries,
      types,
      util,
      writes,
      tests: {
        limit: () => {
          const parentUid = "04-13-2022";
          Promise.all(
            Array(20)
              .fill(null)
              .map((_, i) =>
                writes
                  .createPage({
                    title: `Test page ${i + 1}`,
                    tree: Array(i + 10)
                      .fill(null)
                      .map((_, j) => ({ text: `Block ${j + 1}` })),
                  })
                  .then(() =>
                    writes.createBlock({
                      node: { text: `[[Test page ${i + 1}]]` },
                      order: i + 1,
                      parentUid,
                    })
                  )
              )
          ).then(() => console.log("Okay I'm done"));
        },
        cleanup: () => {
          Promise.all(
            Array(20)
              .fill(null)
              .map((_, i) =>
                window.roamAlphaAPI.deletePage({
                  page: {
                    uid: queries.getPageUidByPageTitle(`Test page ${i + 1}`),
                  },
                })
              )
          ).then(() => console.log("Okay I'm done"));
        },
        sb: () => {
          const location = window.roamAlphaAPI.ui.getFocusedBlock();
          components.renderCursorMenu({
            initialItems: [
              {
                text: "NOCURSOR",
                id: "NOCURSOR",
                help: "Workflow modifier that removes the cursor from Roam Blocks at the end of the workflow",
              },
              {
                text: "HIDE",
                id: "HIDE",
                help: "Workflow modifier that hides this workflow from the standard SmartBlock menu execution",
              },
            ],
            onItemSelect: async (item) => {
              if (location) {
                await writes.updateBlock({
                  uid: location?.["block-uid"],
                  text: `<%${item.text}%>`,
                });
                components.renderToast({
                  id: "smartblocks-command-help",
                  content: `###### ${item.text}\n\n${item.help}`,
                  position: "bottom-right",
                  timeout: 10000,
                });
                await window.roamAlphaAPI.ui.setBlockFocusAndSelection({
                  location,
                  selection: { start: 8 },
                });
              } else {
                console.log("AHHH MAYDAYMAYDAY");
              }
            },
            textarea: document.activeElement as HTMLTextAreaElement,
          });
        },
      },
    };
  },
  onunload: () => {
    window.roamjs?.loaded.delete("components");
    delete window.roamjs?.extension.components;
  },
};
