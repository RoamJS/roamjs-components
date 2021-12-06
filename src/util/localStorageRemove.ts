import getLocalStorageKey from "./getLocalStorageKey";

const localStorageRemove = (key: string): void =>
  localStorage.removeItem(getLocalStorageKey(key));

export default localStorageRemove;
