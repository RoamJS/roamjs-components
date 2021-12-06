import getLocalStorageKey from "./getLocalStorageKey";

export const localStorageGet = (key: string): string =>
  localStorage.getItem(getLocalStorageKey(key)) || "";

export default localStorageGet;
