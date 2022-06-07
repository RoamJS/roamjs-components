import axios from "axios";
import addStyle from "../dom/addStyle";

const runExtension = (
  args:
    | string
    | {
        skipAnalytics?: boolean;
        roamMarketplace?: boolean;
        extensionId: string;
        run?: () => void | Promise<void>;
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

  const onload = () => {
    if (window.roamjs?.loaded?.has?.(extensionId)) {
      return;
    }
    window.roamjs = {
      loaded: window.roamjs?.loaded || new Set(),
      extension: window.roamjs?.extension || {},
      version: window.roamjs?.version || {},
      dynamicElements: window.roamjs?.dynamicElements || new Set(),
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
    if (result) {
      result.then(dispatch);
    } else {
      dispatch();
    }
  };

  const onunload = () => {
    unload?.();
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
