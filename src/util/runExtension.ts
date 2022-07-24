import { createConfigObserver } from "../components/ConfigPage";
import CustomPanel from "../components/ConfigPanels/CustomPanel";
import FlagPanel from "../components/ConfigPanels/FlagPanel";
import SelectPanel from "../components/ConfigPanels/SelectPanel";
import TextPanel from "../components/ConfigPanels/TextPanel";
import { Field, UnionField } from "../components/ConfigPanels/types";
import addStyle from "../dom/addStyle";
import getBasicTreeByParentUid from "../queries/getBasicTreeByParentUid";
import setInputSetting from "./setInputSetting";
import toConfigPageName from "./toConfigPageName";
import { render as renderSimpleAlert } from "../components/SimpleAlert";
import { OnloadArgs } from "../types/native";
import getSubTree from "./getSubTree";
import { createBlock, deleteBlock } from "../writes";

type RunReturn = {
  elements?: HTMLElement[];
  observers?: MutationObserver[];
  domListeners?: (
    | {
        el: Window;
        type: keyof WindowEventMap;
        listener: (
          this: Window,
          ev: WindowEventMap[keyof WindowEventMap]
        ) => void;
      }
    | {
        el: Document;
        type: keyof DocumentEventMap;
        listener: (
          this: Document,
          ev: DocumentEventMap[keyof DocumentEventMap]
        ) => void;
      }
    | {
        el: HTMLElement;
        type: keyof HTMLElementEventMap;
        listener: (
          this: HTMLElement,
          ev: HTMLElementEventMap[keyof HTMLElementEventMap]
        ) => void;
      }
  )[];
  commands?: string[];
  timeouts?: { timeout: number }[];
};

const runExtension = (
  args:
    | string
    | {
        migratedTo?: string;
        roamDepot?: boolean;
        extensionId: string;
        run?: (
          args: OnloadArgs
        ) => void | Promise<void> | RunReturn | Promise<RunReturn>;
        unload?: () => void | Promise<void>;
      },

  // @deprecated both args
  _run: () => void | Promise<void> = Promise.resolve
): void | { onload: (args: OnloadArgs) => void; onunload: () => void } => {
  const extensionId = typeof args === "string" ? args : args.extensionId;
  const run = typeof args === "string" ? _run : args.run;
  const roamDepot =
    typeof args === "string"
      ? false
      : args.roamDepot ||
        process.env.ROAM_MARKETPLACE === "true" ||
        process.env.ROAM_DEPOT === "true";
  const unload = typeof args === "string" ? () => Promise.resolve : args.unload;
  const migratedTo = typeof args === "string" ? "" : args.migratedTo;

  let loaded: RunReturn | undefined | void = undefined;
  let configObserver: MutationObserver | undefined = undefined;
  let configPageUid = "";
  const onload = (args: OnloadArgs) => {
    if (window.roamjs?.loaded?.has?.(extensionId)) {
      return;
    }
    window.roamjs = {
      loaded: window.roamjs?.loaded || new Set(),
      extension: window.roamjs?.extension || {},
      version: window.roamjs?.version || {},
      actions: {},
    };
    window.roamjs.loaded.add(extensionId);
    window.roamjs.version[extensionId] =
      process.env.ROAMJS_VERSION || process.env.NODE_ENV || "";

    addStyle(
      `.bp3-button:focus {
    outline-width: 2px;
  }`,
      "roamjs-default"
    );

    const result = run?.(args);
    const dispatch = () => {
      document.body.dispatchEvent(new Event(`roamjs:${extensionId}:loaded`));
    };
    Promise.resolve(result).then((res) => {
      loaded = res;
      dispatch();
    });
  };

  const onunload = () => {
    unload?.();
    if (loaded) {
      configObserver?.disconnect?.();
      (loaded.elements || []).forEach((e) => e.remove());
      (loaded.observers || []).forEach((e) => e.disconnect());
      (loaded.domListeners || []).forEach((e) =>
        e.el.removeEventListener(e.type, e.listener)
      );
      (loaded.commands || []).forEach((label) =>
        window.roamAlphaAPI.ui.commandPalette.removeCommand({ label })
      );
      (loaded.timeouts || []).forEach((e) => window.clearTimeout(e.timeout));
    }
    delete window.roamjs?.extension[extensionId];
    delete window.roamjs?.version[extensionId];
    window.roamjs?.loaded.delete(extensionId);
    if (!window.roamjs?.loaded.size) {
      document.getElementById("roamjs-default")?.remove();
    }
    // how to handle adding RoamJS token command? it's own extension depending on dependency management?
  };
  if (roamDepot) {
    return {
      onload,
      onunload,
    };
  } else {
    if (migratedTo) {
      renderSimpleAlert({
        content: `ATTENTION: This RoamJS extension (${extensionId}) could now be found in the RoamDepot! It has been migrated to the ${migratedTo} extension from RoamDepot, which you could find by entering the Roam Depot Marketplace from the command palette.

Please remove the \`{{[[roam/js]]}}\` code that installed this extension and refresh before installing from RoamDepot.`,
      });
    }
    const title = toConfigPageName(extensionId);
    const mockSettingSet = (key: string, v: unknown, parentUid: string) => {
      if (typeof v === "boolean") {
        const tree = getBasicTreeByParentUid(parentUid);
        const field = getSubTree({ tree, key });
        if (v && !field.uid) {
          createBlock({ parentUid, node: { text: key } });
        } else if (!v && field.uid) {
          deleteBlock(field.uid);
        }
      } else if (typeof v === "string" || typeof v === "number") {
        setInputSetting({
          blockUid: parentUid,
          key,
          value: `${v}`,
        });
      } else if (Array.isArray(v)) {
        const tree = getBasicTreeByParentUid(parentUid);
        const field = getSubTree({ tree, key });
        const uid = field.uid || window.roamAlphaAPI.util.generateUID();
        if (!field.uid) {
          createBlock({ parentUid, node: { text: key, uid } });
        } else {
          field.children.map((c) => deleteBlock(c.uid));
        }
        v.forEach((c, order) =>
          createBlock({ parentUid, node: { text: c }, order })
        );
      } else if (typeof v === "object" && v !== null) {
        const tree = getBasicTreeByParentUid(parentUid);
        const field = getSubTree({ tree, key });
        const uid = field.uid || window.roamAlphaAPI.util.generateUID();
        if (!field.uid) {
          createBlock({ parentUid, node: { text: key, uid } });
        } else {
          field.children.map((c) => deleteBlock(c.uid));
        }
        Object.entries(v).forEach(([kk, vv]) => mockSettingSet(kk, vv, uid));
      }
    };
    const mockSettingGet = (key: string, parentUid: string): unknown => {
      const tree = getBasicTreeByParentUid(parentUid);
      const field = getSubTree({ tree, key });
      if (field.uid) {
        if (field.children.length === 0) {
          return true;
        } else if (
          field.children.length === 1 &&
          field.children[0].children.length === 0
        ) {
          return field.children[0].text;
        } else {
          return Object.fromEntries(
            field.children.map((c) => [c.text, mockSettingGet(c.text, c.uid)])
          );
        }
      }
      return "";
    };
    return onload({
      extensionAPI: {
        settings: {
          get: (key) => mockSettingGet(key, configPageUid),
          getAll: () =>
            Object.fromEntries(
              getBasicTreeByParentUid(configPageUid).map((t) => [
                t.text,
                mockSettingGet(t.text, configPageUid),
              ])
            ),
          set: (key, v) => mockSettingSet(key, v, configPageUid),
          panel: {
            create: (config) => {
              createConfigObserver({
                title,
                config: config.settings.map((s) => {
                  if (s.action.type === "button") {
                    // what is this used for?
                    return {
                      title: s.id,
                      description: s.description,
                      Panel: FlagPanel,
                    };
                  } else if (s.action.type === "input") {
                    return {
                      title: s.id,
                      description: s.description,
                      Panel: TextPanel,
                    };
                  } else if (s.action.type === "select") {
                    return {
                      title: s.id,
                      description: s.description,
                      Panel: SelectPanel,
                    };
                  } else if (s.action.type === "switch") {
                    return {
                      title: s.id,
                      description: s.description,
                      Panel: FlagPanel,
                    };
                  } else if (s.action.type === "reactComponent") {
                    return {
                      title: s.id,
                      description: s.description,
                      Panel: CustomPanel,
                      options: {
                        component: s.action.component,
                      },
                    };
                  } else {
                    throw new Error(
                      `unknown config type: ${JSON.stringify(s.action)}`
                    );
                  }
                  // typescript why do I need this here
                }) as Field<UnionField>[],
              }).then(({ observer, pageUid }) => {
                configObserver = observer;
                configPageUid = pageUid;
              });
            },
          },
        },
      },
    });
  }
};

export default runExtension;
