type PostHogErrorProperties = {
  $exception_list: {
    type?: string;
    value?: string;
    mechanism?: {
      handled?: boolean;
      type?: string;
      synthetic?: boolean;
    };
    stacktrace?: {
      type: "raw";
      frames?: {
        filename?: string;
        function?: string;
        lineno?: number;
        colno?: number;
        chunk_id?: string;
      }[];
    };
  }[];
  $exception_level?: string;
};

type ErrorTrackingModule = {
  ErrorPropertiesBuilder: new (coercers: unknown[], stackParser: unknown) => {
    buildFromUnknown: (
      input: unknown,
      hint?: {
        mechanism?: { handled?: boolean; type?: "generic" };
      }
    ) => PostHogErrorProperties;
  };
  DOMExceptionCoercer: new () => unknown;
  PromiseRejectionEventCoercer: new () => unknown;
  ErrorEventCoercer: new () => unknown;
  ErrorCoercer: new () => unknown;
  EventCoercer: new () => unknown;
  ObjectCoercer: new () => unknown;
  StringCoercer: new () => unknown;
  PrimitiveCoercer: new () => unknown;
  createDefaultStackParser: () => unknown;
  getInjectedReleaseId: () => string | undefined;
};

// TypeScript 4 cannot parse the package's `export type *` declaration syntax.
/* eslint-disable @typescript-eslint/no-var-requires */
const ErrorTracking =
  require("@posthog/core/error-tracking") as ErrorTrackingModule;
/* eslint-enable @typescript-eslint/no-var-requires */

type StartupFailureProperties = {
  extension_id: string;
  extension_version: string;
  roamjs_build_version: string;
  environment: string;
  error_message: string;
  error_stack: string;
};

type CaptureExtensionStartupFailureArgs = {
  error: unknown;
  extensionId: string;
  extensionVersion: string;
  roamJSBuildVersion: string;
  environment: string;
  postHogToken: string;
  postHogHost: string;
  sensitiveValues?: string[];
  fetcher?: typeof fetch;
};

type PostHogExceptionPayload = {
  api_key: string;
  event: "$exception";
  properties: PostHogErrorProperties &
    StartupFailureProperties & {
      distinct_id: string;
      $lib: "roamjs-components";
      $process_person_profile: false;
      $release_id?: string;
    };
};

const REDACTED_VALUE = "[redacted]";

const errorPropertiesBuilder = new ErrorTracking.ErrorPropertiesBuilder(
  [
    new ErrorTracking.DOMExceptionCoercer(),
    new ErrorTracking.PromiseRejectionEventCoercer(),
    new ErrorTracking.ErrorEventCoercer(),
    new ErrorTracking.ErrorCoercer(),
    new ErrorTracking.EventCoercer(),
    new ErrorTracking.ObjectCoercer(),
    new ErrorTracking.StringCoercer(),
    new ErrorTracking.PrimitiveCoercer(),
  ],
  ErrorTracking.createDefaultStackParser()
);

const redactSensitiveValues = ({
  value,
  sensitiveValues,
}: {
  value: string;
  sensitiveValues: string[];
}): string =>
  sensitiveValues
    .filter(Boolean)
    .reduce(
      (sanitizedValue, sensitiveValue) =>
        sanitizedValue.split(sensitiveValue).join(REDACTED_VALUE),
      value
    );

const sanitizeError = ({
  error,
  sensitiveValues,
}: {
  error: unknown;
  sensitiveValues: string[];
}): Error => {
  const normalizedError =
    error instanceof Error ? error : new Error(String(error));
  const sanitizedError = new Error(
    redactSensitiveValues({
      value: normalizedError.message,
      sensitiveValues,
    })
  );
  sanitizedError.name = normalizedError.name;
  sanitizedError.stack = redactSensitiveValues({
    value: normalizedError.stack || "",
    sensitiveValues,
  });
  return sanitizedError;
};

export const createPostHogExceptionPayload = ({
  error,
  extensionId,
  extensionVersion,
  roamJSBuildVersion,
  environment,
  postHogToken,
  sensitiveValues = [],
}: Omit<
  CaptureExtensionStartupFailureArgs,
  "postHogHost" | "fetcher"
>): PostHogExceptionPayload => {
  const sanitizedError = sanitizeError({ error, sensitiveValues });
  const errorProperties = errorPropertiesBuilder.buildFromUnknown(
    sanitizedError,
    { mechanism: { handled: true, type: "generic" } }
  );
  const releaseId = ErrorTracking.getInjectedReleaseId();

  return {
    api_key: postHogToken,
    event: "$exception",
    properties: {
      ...errorProperties,
      ...(releaseId ? { $release_id: releaseId } : {}),
      distinct_id: `roamjs-extension:${extensionId}`,
      $lib: "roamjs-components",
      $process_person_profile: false,
      extension_id: extensionId,
      extension_version: extensionVersion,
      roamjs_build_version: roamJSBuildVersion,
      environment,
      error_message: sanitizedError.message,
      error_stack: sanitizedError.stack || "",
    },
  };
};

const getCaptureUrl = (postHogHost: string): string =>
  `${postHogHost.replace(/\/$/, "")}/i/v0/e/`;

const captureExtensionStartupFailure = async ({
  fetcher = fetch,
  postHogHost,
  ...payloadArgs
}: CaptureExtensionStartupFailureArgs): Promise<void> => {
  if (
    payloadArgs.environment === "development" ||
    !payloadArgs.postHogToken ||
    !postHogHost
  ) {
    return;
  }

  try {
    await fetcher(getCaptureUrl(postHogHost), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(createPostHogExceptionPayload(payloadArgs)),
      keepalive: true,
    });
  } catch {
    // Failure reporting must never interfere with local extension feedback.
  }
};

export default captureExtensionStartupFailure;
