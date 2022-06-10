import getAuthorizationHeader from "../util/getAuthorizationHeader";

const apiGet = <T extends Record<string, unknown> = Record<string, never>>(
  args: string | { path: string; anonymous?: boolean }
) => {
  const path = typeof args === "string" ? args : args.path;
  const anonymous = typeof args === "string" ? false : args.anonymous;
  return fetch(`${process.env.API_URL}/${path}`, {
    headers: anonymous ? { Authorization: getAuthorizationHeader() } : {},
  }).then((r) => {
    if (!r.ok) {
      return r.text().then(Promise.reject);
    }
    return r.json().then((r) => r as T);
  });
};

export default apiGet;
