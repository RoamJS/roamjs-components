import { Registry } from "../types";
import { getRoamJSExtensionIdEnv } from "./env";

const removeFromRegistry = (detail: Partial<Registry>) =>
  document.body.dispatchEvent(
    new CustomEvent(`roamjs:${getRoamJSExtensionIdEnv()}:unregister`, {
      detail,
    })
  );

export default removeFromRegistry;
