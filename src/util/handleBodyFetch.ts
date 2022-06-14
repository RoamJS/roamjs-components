import getAuthorizationHeader from "./getAuthorizationHeader";
import handleFetch from "./handleFetch";

const handleBodyFetch =
  (method: "POST" | "PUT") =>
  <T extends Record<string, unknown> = Record<string, never>>(
    args:
      | string
      | {
          path: string;
          domain?: string;
          data?: Record<string, unknown>;
          authorization?: string;
          anonymous?: boolean;
        },
    _data?: Record<string, unknown>
  ) => {
    const path = typeof args === "string" ? args : args.path;
    const data = typeof args === "string" ? _data : args.data;
    const domain = typeof args !== "string" && args.domain;

    const body =
      process.env.NODE_ENV === "development"
        ? JSON.stringify({ dev: true, ...data })
        : JSON.stringify(data || {});
    const headers = {
      "Content-Type": "application/json",
    } as Record<string, string>;
    if (typeof args === "string" || !args.anonymous) {
      headers.Authorization =
        typeof args !== "string" && args.authorization
          ? args.authorization
          : getAuthorizationHeader();
    }
    
    return handleFetch<T>(
      fetch(`${domain || process.env.API_URL || "https://lambda.roamjs.com"}/${path}`, {
        method,
        body,
        headers,
      })
    );
  };

export default handleBodyFetch;
