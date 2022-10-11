import { getNodeEnv } from "./env";
import handleFetch, { HandleFetchArgs } from "./handleFetch";

const handleBodyFetch =
  (method: "POST" | "PUT") =>
  <T extends Record<string, unknown> | ArrayBuffer = Record<string, never>>(
    args: string | HandleFetchArgs,
    _data?: Record<string, unknown>
  ) => {
    const { data, ...fetchArgs } =
      typeof args === "string" ? { path: args, data: _data } : args;

    return handleFetch<T>((url, init) => {
      const body =
        data instanceof Uint8Array
          ? data
          : getNodeEnv() === "development" &&
            /(localhost|roamjs)/.test(url.toString())
          ? JSON.stringify({ dev: true, ...data })
          : JSON.stringify(data || {});
      return [
        url,
        {
          ...init,
          body,
          headers: Object.fromEntries(
            Object.entries({
              "Content-Type": "application/json",
              ...init?.headers,
            }).filter((h) => !!h[1])
          ),
          method,
        },
      ];
    }, fetchArgs);
  };

export default handleBodyFetch;
