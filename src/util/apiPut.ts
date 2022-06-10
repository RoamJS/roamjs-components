import getAuthorizationHeader from "../util/getAuthorizationHeader";

const apiPut = <T extends Record<string, unknown> = Record<string, never>>(
  path: string,
  data?: Record<string, unknown>
) =>
  fetch(`${process.env.API_URL}/${path}`, {
    method: "PUT",
    body: JSON.stringify(data || {}),
    headers: {
      Authorization: getAuthorizationHeader(),
      "Content-Type": "application/json",
    },
  }).then((r) => {
    if (!r.ok) {
      return r.text().then(Promise.reject);
    }
    return r.json().then((r) => r as T);
  });

export default apiPut;
