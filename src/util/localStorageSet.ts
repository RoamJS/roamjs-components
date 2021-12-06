import getLocalStorageKey from "./getLocalStorageKey";

export const localStorageSet = (key: string, val: string): void =>
  localStorage.setItem(getLocalStorageKey(key), val);

export default localStorageSet;
