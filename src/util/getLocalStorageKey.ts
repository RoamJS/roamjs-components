import getGraph from "./getGraph";

const getLocalStorageKey = (key: string): string =>
  `roamjs:${key}:${getGraph()}`;

export default getLocalStorageKey;
