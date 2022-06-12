import handleBodyFetch from "./handleBodyFetch";

const apiPut = <T extends Record<string, unknown> = Record<string, never>>(
  ...args: Parameters<ReturnType<typeof handleBodyFetch>>
) => {
   return handleBodyFetch("PUT")<T>(...args);
};

export default apiPut;
