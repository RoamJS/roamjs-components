import getAuthorizationHeader from "./getAuthorizationHeader";

export type HandleFetchArgs = {
  path?: string;
  domain?: string;
  href?: string;
  data?: Record<string, unknown>;
  authorization?: string;
  anonymous?: boolean;
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
  }: Pick<RequestInit, "method"> & Omit<HandleFetchArgs, "data">
) => {
  const url = new URL(
    href ||
      `${domain || process.env.API_URL || "https://lambda.roamjs.com"}/${path}`
  );
  const defaultHeaders = !anonymous
    ? { Authorization: authorization || getAuthorizationHeader() }
    : ({} as HeadersInit);
  return fetch(
    ...transformArgs(url, {
      method,
      headers: defaultHeaders,
    })
  ).then((r) => {
    if (!r.ok) {
      return r.text().then((e) => Promise.reject(new Error(e)));
    } else if (r.status === 204) {
      return {};
    }
    return r
      .json()
      .then((r) => r as T)
      .catch(() => r.text());
  });
};

export default handleFetch;
