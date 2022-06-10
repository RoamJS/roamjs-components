import type { RoamError } from "../types";
import { updateActiveBlock } from "../writes";

const genericError = (e: Partial<Error & RoamError>): string => {
  const message = e.message || e.raw || "Unknown Error Occurred";
  const errMsg = `Error: ${
    message.length > 50 ? `${message.substring(0, 50)}...` : message
  }`;
  updateActiveBlock(errMsg);
  return errMsg;
};

export default genericError;
