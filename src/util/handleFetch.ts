const handleFetch = <T extends Record<string, unknown> = Record<string, never>>(
  _fetch: Promise<Response>
) =>
  _fetch.then((r) => {
    if (!r.ok) {
      return r.text().then((e) => Promise.reject(new Error(e)));
    }
    return r.json().then((r) => r as T);
  });

export default handleFetch;
