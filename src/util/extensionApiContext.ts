import { OnloadArgs } from "../types";

let extensionApi: OnloadArgs["extensionAPI"] | null = null;

export const provideExtensionApi = (api: OnloadArgs["extensionAPI"]) => {
  if (extensionApi) {
    throw new Error("Extension API already provided");
  }
  extensionApi = api;
};

const getExtensionApi = () => {
  if (!extensionApi) throw new Error("Extension API not provided");
  return extensionApi;
};

export default getExtensionApi;
