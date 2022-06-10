import getAuthorizationHeader from "../util/getAuthorizationHeader";

const apiPost = <T extends Record<string, unknown> = Record<string, never>>(
  path: string,
  data: Record<string, unknown> = {},
  options: { anonymous?: true } = {}
) => {
  const headers = {
    "Content-Type": "application/json",
  } as Record<string, string>;
  if (!options.anonymous) {
    headers.Authorization = getAuthorizationHeader();
  }
  return fetch(`${process.env.API_URL}/${path}`, {
    method: "POST",
    body: JSON.stringify(data),
    headers,
  }).then((r) => {
    if (!r.ok) {
      return r.text().then(Promise.reject);
    }
    return r.json().then((r) => r as T);
  });
};

export default apiPost;
