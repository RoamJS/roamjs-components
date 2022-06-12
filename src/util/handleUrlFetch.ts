import getAuthorizationHeader from "../util/getAuthorizationHeader";
import handleFetch from "./handleFetch";

const handleUrlFetch =
  (method: "GET" | "DELETE") =>
  <T extends Record<string, unknown> = Record<string, never>>(
    args:
      | string
      | {
          path: string;
          anonymous?: boolean;
          authorization?: string;
          data?: Record<string, string>;
        }
  ) => {
    const path = typeof args === "string" ? args : args.path;
    const anonymous = typeof args === "string" ? false : args.anonymous;
    const Authorization =
      typeof args !== "string" && args.authorization
        ? args.authorization
        : getAuthorizationHeader();
    const params = typeof args !== "string" && args.data ? args.data : {};

    const url = new URL(
      `${process.env.API_URL || "https://lambda.roamjs.com"}/${path}`
    );
    if (process.env.NODE_ENV === "development") {
      url.searchParams.set("dev", "true");
    }
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

    return handleFetch<T>(
      fetch(url, {
        method,
        headers: anonymous ? {} : { Authorization },
      })
    );
  };

export default handleUrlFetch;
