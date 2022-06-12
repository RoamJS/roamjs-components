import getAuthorizationHeader from "../util/getAuthorizationHeader";

const apiDelete = <T extends Record<string, unknown> = Record<string, never>>(
  path: string
) =>
  fetch(`${process.env.API_URL}/${path}`, {
    method: "DELETE",
    headers: { Authorization: getAuthorizationHeader() },
  }).then((r) => {
    if (!r.ok) {
      return r.text().then((e) => Promise.reject(new Error(e)));
    }
    return r.json().then((r) => r as T);
  });

export default apiDelete;
