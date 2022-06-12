import handleUrlFetch from "./handleUrlFetch";

const apiDelete = <T extends Record<string, unknown> = Record<string, never>>(
  ...args: Parameters<ReturnType<typeof handleUrlFetch>>
) => {
  return handleUrlFetch("DELETE")<T>(...args);
};

export default apiDelete;
