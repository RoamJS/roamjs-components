import { getNodeEnv } from "./env";
import handleFetch, { HandleFetchArgs } from "./handleFetch";

const handleBodyFetch =
  (method: "POST" | "PUT") =>
  <T extends Record<string, unknown> = Record<string, never>>(
    args: string | HandleFetchArgs,
    _data?: Record<string, unknown>
  ) => {
    const { data, ...fetchArgs } =
      typeof args === "string" ? { path: args, data: _data } : args;

    const body =
      data instanceof Uint8Array
        ? data
        : getNodeEnv() === "development"
        ? JSON.stringify({ dev: true, ...data })
        : JSON.stringify(data || {});

    return handleFetch<T>(
      (url, init) => [
        url,
        {
          ...init,
          body,
          headers: {
            ...init?.headers,
            "Content-Type": "application/json",
          },
          method,
        },
      ],
      fetchArgs
    );
  };

export default handleBodyFetch;
