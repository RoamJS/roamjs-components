import { getApiUrlEnv } from "./env";
import getAuthorizationHeader from "./getAuthorizationHeader";

export type HandleFetchArgs = {
  path?: string;
  domain?: string;
  href?: string;
  data?: Record<string, unknown> | Uint8Array;
  authorization?: string;
  anonymous?: boolean;
  headers?: Record<string, string>;
  buffer?: boolean;
};

// type HandleFetchReturn<T, B> = B extends true
//   ? Promise<ArrayBuffer>
//   : Promise<T>;

type HandleFetch = <T extends Record<string, unknown> | ArrayBuffer>(
  transformArgs: (...info: [URL, RequestInit]) => Parameters<typeof fetch>,
  args: Pick<RequestInit, "method"> & Omit<HandleFetchArgs, "data">
  // ) => HandleFetchReturn<T, B>;
) => Promise<T>;

const handleFetch: HandleFetch = (
  transformArgs,
  { method, anonymous, authorization, path, href, domain, headers = {}, buffer }
) => {
  const url = new URL(href || `${domain || getApiUrlEnv()}/${path}`);
  const defaultHeaders = !anonymous
    ? { Authorization: authorization || getAuthorizationHeader() }
    : ({} as HeadersInit);
  return fetch(
    ...transformArgs(url, {
      method,
      headers: { ...defaultHeaders, ...headers },
    })
  ).then((r) => {
    if (!r.ok) {
      return r.text().then((e) => {
        try {
          return Promise.reject(JSON.parse(e));
        } catch {
          return Promise.reject(new Error(e));
        }
      });
    } else if (r.status === 204) {
      return {} as ReturnType<HandleFetch>;
    }

    return (
      buffer
        ? r.arrayBuffer()
        : r.json().then((d) => ({
            ...(Array.isArray(d) ? { data: d } : d),
            headers: Object.fromEntries(r.headers.entries()),
            status: r.status,
          }))
    ).catch(() => r.text().then((e) => Promise.reject(new Error(e))));
  });
};

export default handleFetch;
