import { getNodeEnv } from "./env";
import handleFetch, { HandleFetchArgs } from "./handleFetch";

const handleUrlFetch =
  (method: "GET" | "DELETE") =>
  <T extends Record<string, unknown> = Record<string, never>>(
    args: string | HandleFetchArgs,
    _data?: Record<string, unknown>
  ) => {
    const { data = {}, ...fetchArgs } =
      typeof args === "string" ? { path: args, data: _data } : args;

    return handleFetch<T>((url, init) => {
      if (getNodeEnv() === "development") {
        url.searchParams.set("dev", "true");
      }
      Object.entries(data).forEach(([k, v]) =>
        url.searchParams.set(k, v as string)
      );
      return [
        url,
        {
          ...init,
          method,
        },
      ];
    }, fetchArgs);
  };

export default handleUrlFetch;
