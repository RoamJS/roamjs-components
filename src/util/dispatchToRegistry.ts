import { RunReturn } from "../types";
import { getRoamJSExtensionIdEnv } from "./env";

const dispatchToRegistry = (detail: Partial<RunReturn>) =>
  document.body.dispatchEvent(
    new CustomEvent(`roamjs:${getRoamJSExtensionIdEnv()}:register`, {
      detail,
    })
  );

export default dispatchToRegistry;
