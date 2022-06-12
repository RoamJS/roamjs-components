import handleBodyFetch from "./handleBodyFetch";

const apiPost = <T extends Record<string, unknown> = Record<string, never>>(
  ...args: Parameters<ReturnType<typeof handleBodyFetch>>
) => {
  return handleBodyFetch("POST")<T>(...args);
};

export default apiPost;
