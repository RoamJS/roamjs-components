import axios from "axios";
import addStyle from "../dom/addStyle";

const runExtension = async (
  extensionId: string,
  run: () => void | Promise<void>,
  options: { skipAnalytics?: boolean } = {}
): Promise<void> => {
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

  if (!options.skipAnalytics) {
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

  const result = run();
  const dispatch = () => {
    document.body.dispatchEvent(new Event(`roamjs:${extensionId}:loaded`));
  };
  if (result) {
    result.then(dispatch);
  } else {
    dispatch();
  }
};

export default runExtension;
