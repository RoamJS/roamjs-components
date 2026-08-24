import apiGet from "../../src/util/apiGet";
import { test, expect } from "@playwright/test";

const originalNodeEnv = process.env.NODE_ENV;
const originalFetch = globalThis.fetch;

const mockFetch = (requestedUrls: string[]): void => {
  globalThis.fetch = ((input: RequestInfo | URL) => {
    requestedUrls.push(input.toString());
    return Promise.resolve({
      ok: true,
      status: 200,
      headers: new Headers({ "content-type": "application/json" }),
      json: () => Promise.resolve({ success: true }),
      text: () => Promise.resolve(""),
    } as Response);
  }) as typeof fetch;
};

test.afterEach(() => {
  process.env.NODE_ENV = originalNodeEnv;
  globalThis.fetch = originalFetch;
});

test("apiGet only appends dev query param for RoamJS hosts", async () => {
  const requestedUrls: string[] = [];
  process.env.NODE_ENV = "development";
  mockFetch(requestedUrls);

  await apiGet({
    anonymous: true,
    domain: "https://people.googleapis.com",
    path: "v1/people/me/connections",
  });
  await apiGet({
    anonymous: true,
    domain: "https://roamjs.com",
    path: "oauth/session",
  });

  const [googleUrl, roamjsUrl] = requestedUrls.map((url) => new URL(url));

  expect(googleUrl.searchParams.has("dev")).toBe(false);
  expect(roamjsUrl.searchParams.get("dev")).toBe("true");
});
