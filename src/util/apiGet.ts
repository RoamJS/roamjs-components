import handleUrlFetch from "./handleUrlFetch";

const apiGet = <T extends Record<string, unknown> = Record<string, never>>(
  ...args: Parameters<ReturnType<typeof handleUrlFetch>>
) => {
  return handleUrlFetch("GET")<T>(...args);
};

export default apiGet;
