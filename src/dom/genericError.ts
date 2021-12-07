import type { AxiosError } from "axios";
import type { RoamError } from "../types";
import { updateActiveBlock } from "../writes"

const genericError = (e: Partial<AxiosError & RoamError>): string => {
  const message =
    (e.response
      ? typeof e.response.data === "string"
        ? e.response.data
        : JSON.stringify(e.response.data)
      : e.message) ||
    e.raw ||
    "Unknown Error Occurred";
  const errMsg = `Error: ${
    message.length > 50 ? `${message.substring(0, 50)}...` : message
  }`;
  updateActiveBlock(errMsg);
  return errMsg;
}

export default genericError;
