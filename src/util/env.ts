// Some developers may use roamjs-components without RoamJS scripting, in which case
// envs wont be interpolated. best way to deal with that afaik is to try to get the value
// catch defaulting to a known value

// Cannot do a DRY approach either because bundlers need the full `process.env.VAR` text
// outlined to be replaced

export const getNodeEnv = (defaultValue = "production") => {
  try {
    return process.env.NODE_ENV || defaultValue;
  } catch {
    return defaultValue;
  }
};

export const getRoamJSVersionEnv = () => {
  try {
    if (process.env.ROAMJS_VERSION) {
      return process.env.ROAMJS_VERSION;
    }
  } catch {
    // Fall through when a bundler did not interpolate this optional override.
  }
  try {
    return process.env.VERSION || getNodeEnv("");
  } catch {
    return getNodeEnv("");
  }
};

export const getApiUrlEnv = () => {
  const defaultValue =
    getNodeEnv() === "production"
      ? "https://lambda.roamjs.com"
      : "http://localhost:3003";
  try {
    return process.env.API_URL || defaultValue;
  } catch {
    return defaultValue;
  }
};

export const getRoamJSExtensionIdEnv = () => {
  try {
    return (
      process.env.PACKAGE_NAME || "roamjs"
    );
  } catch {
    return "roamjs";
  }
};

export const getPostHogTokenEnv = (): string => {
  try {
    return process.env.POSTHOG_TOKEN || "";
  } catch {
    return "";
  }
};

export const getPostHogHostEnv = (): string => {
  try {
    return process.env.POSTHOG_HOST || "";
  } catch {
    return "";
  }
};
