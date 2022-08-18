import { RunReturn } from "../types";
import { getRoamJSExtensionIdEnv } from "./env";

const removeFromRegistry = (detail: Partial<RunReturn>) =>
  document.body.dispatchEvent(
    new CustomEvent(`roamjs:${getRoamJSExtensionIdEnv()}:unregister`, {
      detail,
    })
  );

export default removeFromRegistry;
