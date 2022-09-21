import { createConfigObserver } from "../components/ConfigPage";
import CustomPanel from "../components/ConfigPanels/CustomPanel";
import FlagPanel from "../components/ConfigPanels/FlagPanel";
import SelectPanel from "../components/ConfigPanels/SelectPanel";
import TextPanel from "../components/ConfigPanels/TextPanel";
import {
  Field,
  FlagField,
  TextField,
  UnionField,
} from "../components/ConfigPanels/types";
import addStyle from "../dom/addStyle";
import getBasicTreeByParentUid from "../queries/getBasicTreeByParentUid";
import setInputSetting from "./setInputSetting";
import toConfigPageName from "./toConfigPageName";
import { render as renderSimpleAlert } from "../components/SimpleAlert";
import { OnloadArgs } from "../types/native";
import getSubTree from "./getSubTree";
import { createBlock, deleteBlock } from "../writes";
import ReactDOM from "react-dom";
import {
  getNodeEnv,
  getRoamDepotEnv,
  getRoamJSExtensionIdEnv,
  getRoamJSVersionEnv,
  getRoamMarketplaceEnv,
} from "./env";
import type { Registry } from "../types";

type RunReturn =
  | void
  | (Partial<Registry> & { unload?: () => void })
  | (() => void);

type RunExtension = (args: OnloadArgs) => RunReturn | Promise<RunReturn>;

const runExtension = (
  args:
    | string
    | {
        migratedTo?: string;
        roamDepot?: boolean;
        extensionId?: string;
        run?: RunExtension;
      },

  // @deprecated both args
  _run?: RunExtension
): void | { onload: (args: OnloadArgs) => void; onunload: () => void } => {
  const extensionId =
    typeof args === "string"
      ? args
      : args.extensionId || getRoamJSExtensionIdEnv();
  const run = typeof args === "string" ? _run : args.run;
  const roamDepot =
    typeof args === "string"
      ? false
      : args.roamDepot ||
        getRoamMarketplaceEnv() === "true" ||
        getRoamDepotEnv() === "true";
  let unload: (() => void) | undefined;
  const migratedTo = typeof args === "string" ? "" : args.migratedTo;

  const registry: Registry = {
    elements: [],
    reactRoots: [],
    observers: [],
    domListeners: [],
    commands: [],
    timeouts: [],
  };
  const register = (res: Partial<Registry>) => {
    Object.keys(res).forEach((k) => {
      const key = k as keyof Registry;
      const val = res[key];
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore this is actually safe, but dont know how to coerce
      registry[key].push(...val);
    });
  };
  const registerListener = ((e: CustomEvent) => {
    const res = e.detail as Partial<Registry>;
    register(res);
  }) as EventListener;
  document.body.addEventListener(
    `roamjs:${extensionId}:register`,
    registerListener
  );
  registry.domListeners.push({
    listener: registerListener,
    el: document.body,
    type: `roamjs:${extensionId}:register`,
  });
  const unregisterListener = ((e: CustomEvent) => {
    const res = e.detail as Partial<Registry>;
    Object.keys(res).forEach((k) => {
      const key = k as keyof Registry;
      const val = res[key];
      if (val) {
        val.forEach((el) => {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore this is actually safe, but dont know how to coerce
          const idx = registry[key].indexOf(el);
          if (idx > -1) {
            registry[key].splice(idx, 1);
          }
        });
      }
    });
  }) as EventListener;
  document.body.addEventListener(
    `roamjs:${extensionId}:unregister`,
    unregisterListener
  );
  registry.domListeners.push({
    listener: unregisterListener,
    el: document.body,
    type: `roamjs:${extensionId}:unregister`,
  });

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
    window.roamjs.version[extensionId] = getRoamJSVersionEnv();

    registry.elements.push(
      addStyle(
        `.bp3-button:focus {
    outline-width: 2px;
  }`,
        "roamjs-default"
      )
    );

    const result = run?.(args);
    Promise.resolve(result).then((res) => {
      if (typeof res === "function") {
        unload = res;
      } else if (typeof res === "object") {
        const { unload: resUnload, ...registry } = res;
        register(registry);
        unload = resUnload;
      }
      const globalApi = window.roamjs.extension[extensionId];
      if (getNodeEnv() === "development") {
        if (globalApi) globalApi.extensionAPI = args.extensionAPI;
        else
          window.roamjs.extension[extensionId] = {
            extensionAPI: args.extensionAPI,
          };
      }
      document.body.dispatchEvent(new Event(`roamjs:${extensionId}:loaded`));
    });
  };

  const onunload = () => {
    registry.elements.forEach((e) => e.remove());
    registry.reactRoots.forEach((e) => {
      ReactDOM.unmountComponentAtNode(e);
      e.remove();
    });
    registry.observers.forEach((e) => e.disconnect());
    registry.domListeners.forEach((e) =>
      e.el.removeEventListener(e.type, e.listener)
    );
    registry.commands.forEach((label) =>
      window.roamAlphaAPI.ui.commandPalette.removeCommand({ label })
    );
    registry.timeouts.forEach((e) => window.clearTimeout(e.timeout));

    delete window.roamjs?.extension[extensionId];
    delete window.roamjs?.version[extensionId];
    window.roamjs?.loaded.delete(extensionId);
    if (!window.roamjs?.loaded.size) {
      document.getElementById("roamjs-default")?.remove();
    }
    unload?.();
  };
  if (roamDepot) {
    return {
      onload,
      onunload,
    };
  } else {
    if (migratedTo) {
      renderSimpleAlert({
        content: `ATTENTION: This RoamJS extension (${extensionId}) could now be found in the RoamDepot! It has been migrated to the **${migratedTo}** extension from RoamDepot, which you could find by entering the Roam Depot Marketplace from the command palette.

Please remove the \`{{[[roam/js]]}}\` code that installed this extension and refresh before installing from RoamDepot.`,
      });
    }
    const title = toConfigPageName(extensionId);
    const mockSettingSet = (_key: string, v: unknown, parentUid: string) => {
      const key = _key.replace(/-/g, " ");
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
          createBlock({ parentUid: uid, node: { text: c }, order })
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
    const mockSettingGet = (_key: string, parentUid: string): unknown => {
      const tree = getBasicTreeByParentUid(parentUid);
      const key = _key.replace(/-/g, " ");
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
    let configPageUid = "";
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
                    const { onChange, placeholder } = s.action;
                    return {
                      title: s.id,
                      description: s.description,
                      Panel: TextPanel,
                      options: {
                        onChange,
                        placeholder,
                      },
                    } as Field<TextField>;
                  } else if (s.action.type === "select") {
                    return {
                      title: s.id,
                      description: s.description,
                      Panel: SelectPanel,
                      options: {
                        items: s.action.items,
                      },
                    };
                  } else if (s.action.type === "switch") {
                    const { onChange } = s.action;
                    return {
                      title: s.id,
                      description: s.description,
                      Panel: FlagPanel,
                      options: {
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        // @ts-ignore
                        onChange: (_, e) => onChange?.(e),
                      },
                    } as Field<FlagField>;
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
                if (observer) registry.observers.push(observer);
                configPageUid = pageUid;
              });
            },
          },
        },
      },
      extension: {
        version: getRoamJSVersionEnv(),
      },
    });
  }
};

export default runExtension;
