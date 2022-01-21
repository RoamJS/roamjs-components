import getLocalStorageKey from "./getLocalStorageKey";

export const localStorageSet = (key: string, val: string, skipGraph?: true): void =>
  localStorage.setItem(getLocalStorageKey(key, skipGraph), val);

export default localStorageSet;
