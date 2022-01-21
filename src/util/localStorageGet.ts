import getLocalStorageKey from "./getLocalStorageKey";

export const localStorageGet = (key: string, skipGraph?: true): string =>
  localStorage.getItem(getLocalStorageKey(key, skipGraph)) || "";

export default localStorageGet;
