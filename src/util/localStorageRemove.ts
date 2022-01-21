import getLocalStorageKey from "./getLocalStorageKey";

const localStorageRemove = (key: string, skipGraph?: true): void =>
  localStorage.removeItem(getLocalStorageKey(key, skipGraph));

export default localStorageRemove;
