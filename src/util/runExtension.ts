import axios from "axios";
import addStyle from "../dom/addStyle";

type RunReturn = {
  elements?: HTMLElement[];
  observers?: MutationObserver[];
  windowListeners?: {
    type: keyof WindowEventMap;
    listener: (this: Window, ev: WindowEventMap[keyof WindowEventMap]) => any;
  }[];
};

const runExtension = (
  args:
    | string
    | {
        skipAnalytics?: boolean;
        roamMarketplace?: boolean;
        extensionId: string;
        run?: () => void | Promise<void> | RunReturn | Promise<RunReturn>;
        unload?: () => void | Promise<void>;
      },

  // @deprecated both args
  _run: () => void | Promise<void> = Promise.resolve,
  options: { skipAnalytics?: boolean } = {}
): void | { onload: () => void; onunload: () => void } => {
  const extensionId = typeof args === "string" ? args : args.extensionId;
  const run = typeof args === "string" ? _run : args.run;
  const roamMarketplace =
    typeof args === "string"
      ? false
      : args.roamMarketplace || process.env.ROAM_MARKETPLACE === "true";
  const skipAnalytics =
    typeof args === "string" ? options.skipAnalytics : args.skipAnalytics;
  const unload = typeof args === "string" ? () => Promise.resolve : args.unload;

  let loaded: RunReturn | undefined | void = undefined;
  const onload = () => {
    if (window.roamjs?.loaded?.has?.(extensionId)) {
      return;
    }
    window.roamjs = {
      loaded: window.roamjs?.loaded || new Set(),
      extension: window.roamjs?.extension || {},
      version: window.roamjs?.version || {},
    };
    window.roamjs.loaded.add(extensionId);
    window.roamjs.version[extensionId] =
      process.env.ROAMJS_VERSION || process.env.NODE_ENV || "";

    if (!skipAnalytics) {
      axios.post(`https://lambda.roamjs.com/mixpanel`, {
        eventName: "Load Extension",
        properties: { extensionId },
      });
    }
    addStyle(
      `.bp3-button:focus {
    outline-width: 2px;
  }`,
      "roamjs-default"
    );

    const result = run?.();
    const dispatch = () => {
      document.body.dispatchEvent(new Event(`roamjs:${extensionId}:loaded`));
    };
    Promise.resolve(result).then((res) => {
      dispatch();
      loaded = res;
    });
  };

  const onunload = () => {
    unload?.();
    (loaded?.elements || []).forEach((e) => e.remove());
    (loaded?.observers || []).forEach((e) => e.disconnect());
    (loaded?.windowListeners || []).forEach((e) =>
      window.removeEventListener(e.type, e.listener)
    );
    delete window.roamjs?.version[extensionId];
    window.roamjs?.loaded.delete(extensionId);
    if (!window.roamjs?.loaded.size) {
      document.getElementById("roamjs-default")?.remove();
      delete window.roamjs;
    }
    // how to handle adding RoamJS token command? it's own extension depending on dependency management?
  };
  if (roamMarketplace) {
    return {
      onload,
      onunload,
    };
  } else {
    return onload();
  }
};

export default runExtension;
