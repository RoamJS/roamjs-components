import getAuthorizationHeader from "../util/getAuthorizationHeader";

const apiGet = <T extends Record<string, unknown> = Record<string, never>>(
  args:
    | string
    | {
        path: string;
        anonymous?: boolean;
        authorization?: string;
        params?: Record<string, string>;
      }
) => {
  const path = typeof args === "string" ? args : args.path;
  const anonymous = typeof args === "string" ? false : args.anonymous;
  const Authorization =
    typeof args !== "string" && args.authorization
      ? args.authorization
      : getAuthorizationHeader();
  const params = typeof args !== "string" && args.params ? args.params : {};

  const url = new URL(`${process.env.API_URL}/${path}`);
  if (process.env.NODE_ENV === "development") {
    url.searchParams.set("dev", "true");
  }
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  return fetch(url, {
    headers: anonymous ? { Authorization } : {},
  }).then((r) => {
    if (!r.ok) {
      return r.text().then((e) => Promise.reject(new Error(e)));
    }
    return r.json().then((r) => r as T);
  });
};

export default apiGet;
