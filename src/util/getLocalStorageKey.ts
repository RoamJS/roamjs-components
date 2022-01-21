import getGraph from "./getGraph";

const getLocalStorageKey = (key: string, skipGraph?: true): string =>
  `roamjs:${key}${skipGraph ? "" : `:${getGraph()}`}`;

export default getLocalStorageKey;
