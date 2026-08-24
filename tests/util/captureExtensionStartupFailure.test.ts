import { expect, test } from "@playwright/test";
import captureExtensionStartupFailure, {
  createPostHogExceptionPayload,
} from "../../src/util/captureExtensionStartupFailure";

const createError = ({ graphName }: { graphName: string }): Error => {
  const error = new Error(`Could not load ${graphName}`);
  error.stack = `Error: Could not load ${graphName}\n    at startup (https://roamresearch.com/#/app/${graphName}/main.js:10:4)`;
  return error;
};

test("creates a privacy-safe PostHog exception payload", () => {
  const graphName = "private-graph";
  const payload = createPostHogExceptionPayload({
    error: createError({ graphName }),
    extensionId: "pilot-extension",
    extensionVersion: "2.3.4",
    roamJSBuildVersion: "2.3.4-abc123",
    environment: "production",
    postHogToken: "public-project-token",
    sensitiveValues: [graphName],
  });
  const serializedPayload = JSON.stringify(payload);

  expect(payload.event).toBe("$exception");
  expect(payload.properties).toMatchObject({
    distinct_id: "roamjs-extension:pilot-extension",
    $lib: "roamjs-components",
    $process_person_profile: false,
    extension_id: "pilot-extension",
    extension_version: "2.3.4",
    roamjs_build_version: "2.3.4-abc123",
    environment: "production",
    error_message: "Could not load [redacted]",
  });
  expect(payload.properties.$exception_list).toHaveLength(1);
  expect(
    payload.properties.$exception_list[0].stacktrace?.frames
  ).not.toHaveLength(0);
  expect(serializedPayload).not.toContain(graphName);
  expect(serializedPayload).not.toContain("settings");
  expect(serializedPayload).not.toContain("$current_url");
  expect(serializedPayload).not.toContain("$referrer");
  expect(serializedPayload).not.toContain("$session_id");
});

test("only sends configured non-development failures", async () => {
  const requests: { input: RequestInfo | URL; init?: RequestInit }[] = [];
  const fetcher = ((input: RequestInfo | URL, init?: RequestInit) => {
    requests.push({ input, init });
    return Promise.resolve({ ok: true } as Response);
  }) as typeof fetch;
  const commonArgs = {
    error: new Error("startup failed"),
    extensionId: "pilot-extension",
    extensionVersion: "2.3.4",
    roamJSBuildVersion: "2.3.4-abc123",
    postHogToken: "public-project-token",
    postHogHost: "https://us.i.posthog.com/",
    fetcher,
  };

  await captureExtensionStartupFailure({
    ...commonArgs,
    environment: "development",
  });
  await captureExtensionStartupFailure({
    ...commonArgs,
    environment: "production",
    postHogToken: "",
  });
  await captureExtensionStartupFailure({
    ...commonArgs,
    environment: "production",
  });

  expect(requests).toHaveLength(1);
  expect(requests[0].input).toBe("https://us.i.posthog.com/i/v0/e/");
  expect(requests[0].init).toMatchObject({
    method: "POST",
    keepalive: true,
  });
  const body = JSON.parse(String(requests[0].init?.body)) as {
    event: string;
    properties: { extension_id: string };
  };
  expect(body.event).toBe("$exception");
  expect(body.properties.extension_id).toBe("pilot-extension");
});
