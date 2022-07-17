import React, { ChangeEvent } from "react";
import { createConfigObserver } from "../components/ConfigPage";
import CustomPanel from "../components/ConfigPanels/CustomPanel";
import FlagPanel from "../components/ConfigPanels/FlagPanel";
import SelectPanel from "../components/ConfigPanels/SelectPanel";
import TextPanel from "../components/ConfigPanels/TextPanel";
import { Field, UnionField } from "../components/ConfigPanels/types";
import addStyle from "../dom/addStyle";
import getBasicTreeByParentUid from "../queries/getBasicTreeByParentUid";
import getPageUidByPageTitle from "../queries/getPageUidByPageTitle";
import getSettingValueFromTree from "./getSettingValueFromTree";
import setInputSetting from "./setInputSetting";
import toConfigPageName from "./toConfigPageName";
import { render as renderSimpleAlert } from "../components/SimpleAlert";

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

type ButtonAction = {
  type: "button";
  onClick?: (e: MouseEvent) => void;
  content: string;
};

type SwitchAction = {
  type: "switch";
  onChange?: (e: ChangeEvent) => void;
};

type InputAction = {
  type: "input";
  placeholder: string;
  onChange?: (e: ChangeEvent) => void;
};

type SelectAction = {
  type: "select";
  items: string[];
  onChange?: (e: ChangeEvent) => void;
};

type CustomAction = {
  type: "reactComponent";
  component: React.FC;
};

type PanelConfig = {
  tabTitle: string;
  settings: {
    id: string;
    name: string;
    description: string;
    action:
      | ButtonAction
      | SwitchAction
      | InputAction
      | SelectAction
      | CustomAction;
  }[];
};

type OnloadArgs = {
  extensionAPI: {
    settings: {
      get: (k: string) => unknown;
      getAll: () => string[];
      panel: {
        create: (c: PanelConfig) => void;
      };
      set: (k: string, v: unknown) => void;
    };
  };
};

const runExtension = (
  args:
    | string
    | {
        migratedTo?: string;
        roamMarketplace?: boolean;
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
  const roamMarketplace =
    typeof args === "string"
      ? false
      : args.roamMarketplace || process.env.ROAM_MARKETPLACE === "true";
  const unload = typeof args === "string" ? () => Promise.resolve : args.unload;
  const migratedTo = typeof args === "string" ? "" : args.migratedTo;

  let loaded: RunReturn | undefined | void = undefined;
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
  if (roamMarketplace) {
    return {
      onload,
      onunload,
    };
  } else {
    if (migratedTo) {
      renderSimpleAlert({
        content: `ATTENTION: This RoamJS extension could now be found in the RoamDepot! It has been migrated to the ${migratedTo} extension from RoamDepot, which you could find by entering the Roam Depot Marketplace from the command palette.

Please remove the \`{{[[roam/js]]}}\` code that installed this extension and refresh before installing from RoamDepot.`,
      });
    }
    const title = toConfigPageName(extensionId);
    return onload({
      extensionAPI: {
        settings: {
          get: (key) =>
            getSettingValueFromTree({
              tree: getBasicTreeByParentUid(getPageUidByPageTitle(title)),
              key,
            }),
          getAll: () =>
            getBasicTreeByParentUid(getPageUidByPageTitle(title)).map(
              (t) => t.text
            ),
          set: (key, v) =>
            setInputSetting({
              blockUid: getPageUidByPageTitle(title),
              key,
              value: typeof v === "string" ? v : `${v}`,
            }),
          panel: {
            create: (config) =>
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
              }),
          },
        },
      },
    });
  }
};

export default runExtension;
