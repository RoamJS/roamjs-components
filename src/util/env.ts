// Some developers may use roamjs-components without roamjs-scripts, in which case
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
    return process.env.ROAMJS_VERSION || getNodeEnv("");
  } catch {
    return getNodeEnv("");
  }
};

export const getApiUrlEnv = () => {
  try {
    return process.env.API_URL || "https://lambda.roamjs.com";
  } catch {
    return "https://lambda.roamjs.com";
  }
};

export const getRoamMarketplaceEnv = () => {
  try {
    return process.env.ROAM_MARKETPLACE || "";
  } catch {
    return "";
  }
};

export const getRoamDepotEnv = () => {
  try {
    return process.env.ROAM_DEPOT || "";
  } catch {
    return "";
  }
};

export const getRoamJSExtensionIdEnv = () => {
  try {
    return process.env.ROAMJS_EXTENSION_ID || "";
  } catch {
    return "";
  }
};
