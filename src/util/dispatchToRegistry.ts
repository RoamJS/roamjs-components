import { Registry } from "../types";
import { getRoamJSExtensionIdEnv } from "./env";

const dispatchToRegistry = (detail: Partial<Registry>) =>
  document.body.dispatchEvent(
    new CustomEvent(`roamjs:${getRoamJSExtensionIdEnv()}:register`, {
      detail,
    })
  );

export default dispatchToRegistry;
