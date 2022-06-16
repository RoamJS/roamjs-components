const getLocalStorageKey = (key: string, skipGraph?: true): string =>
  `roamjs:${key}${skipGraph ? "" : `:${window.roamAlphaAPI.graph.name}`}`;

export default getLocalStorageKey;
