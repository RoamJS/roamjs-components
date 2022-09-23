import { getApiUrlEnv } from "./env";
import getAuthorizationHeader from "./getAuthorizationHeader";

export type HandleFetchArgs = {
  path?: string;
  domain?: string;
  href?: string;
  data?: Record<string, unknown>;
  authorization?: string;
  anonymous?: boolean;
  headers?: Record<string, string>;
};

const handleFetch = <T extends Record<string, unknown> = Record<string, never>>(
  transformArgs: (...info: [URL, RequestInit]) => Parameters<typeof fetch>,
  {
    method,
    anonymous,
    authorization,
    path,
    href,
    domain,
    headers = {},
  }: Pick<RequestInit, "method"> & Omit<HandleFetchArgs, "data">
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
      return r.text().then((e) => Promise.reject(new Error(e)));
    } else if (r.status === 204) {
      return {} as T;
    }
    return r
      .json()
      .then(
        (d) => ({ ...d, headers: Object.fromEntries(r.headers.entries()) } as T)
      )
      .catch(() => r.text().then((e) => Promise.reject(new Error(e))));
  });
};

export default handleFetch;
