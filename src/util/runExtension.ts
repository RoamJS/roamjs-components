import addStyle from "../dom/addStyle";
import { OnloadArgs } from "../types/native";
import ReactDOM from "react-dom";
import {
  getNodeEnv,
  getRoamJSExtensionIdEnv,
  getRoamJSVersionEnv,
} from "./env";
import type { Registry } from "../types";
import { useSyncExternalStore } from "use-sync-external-store/shim";
import { provideExtensionApi } from "./extensionApiContext";
import apiPost from "./apiPost";
import renderToast from "../components/Toast";

type RunReturn =
  | void
  | (Partial<Registry> & { unload?: () => void })
  | (() => void);

type RunExtension = (args: OnloadArgs) => Promise<RunReturn>;

const renderLoadFailure = ({
  id,
  content,
}: {
  id: string;
  content: string;
}) => {
  try {
    renderToast({ id, content, intent: "danger" });
  } catch (toastError) {
    console.error("Failed to display the extension load error.", toastError);
  }
};

const runExtension = (
  run: RunExtension
): { onload: (args: OnloadArgs) => void; onunload: () => void } => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore React17 shim
  window.React.useSyncExternalStore = useSyncExternalStore;
  let unload: (() => void) | undefined;
  const extensionId = getRoamJSExtensionIdEnv();
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
    provideExtensionApi(args.extensionAPI);
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

    run(args)
      .then((res) => {
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
      })
      .catch((e) => {
        const error = e as Error;
        console.error(`Failed to load ${extensionId} extension.`, error);
        if (getNodeEnv() === "development") {
          renderLoadFailure({
            id: "roamjs-extension-error",
            content: `Failed to load ${extensionId} extension.`,
          });
          return;
        }
        let settings: Record<string, unknown> = {};
        try {
          settings = args.extensionAPI?.settings?.getAll?.() || {};
        } catch (settingsError) {
          console.error(
            "Failed to read extension settings for the error report.",
            settingsError
          );
        }
        apiPost({
          domain: "https://api.samepage.network",
          path: "errors",
          data: {
            method: "extension-error",
            type: "RoamJS Extension Failed to Load",
            data: {
              extensionId,
              settings,
              roamDepotVersion: args.extension?.version || "unknown",
            },
            message: error.message,
            stack: error.stack,
            version: process.env.VERSION,
            notebookUuid: JSON.stringify({
              owner: "RoamJS",
              app: extensionId,
              workspace: window.roamAlphaAPI.graph.name,
            }),
          },
        })
          .then(() =>
            renderLoadFailure({
              id: "roamjs-extension-error",
              content: `Failed to load ${extensionId} extension. An Error Report has been sent to the SamePage team.`,
            })
          )
          .catch((reportError) => {
            console.error(
              "Failed to send the extension load error report.",
              reportError
            );
            renderLoadFailure({
              id: "roamjs-email-error",
              content: `Failed to load ${extensionId} extension. The Error Report also failed to send to the SamePage team, please reach out to them directly at support@samepage.network.`,
            });
          });
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
  return {
    onload,
    onunload,
  };
};

export default runExtension;
