import parser from "ua-parser-js";

const UA = new parser();
const os = UA.getOS();

const getNavigatorInstance = () => {
  if (typeof window !== "undefined") {
    if (window.navigator || navigator) {
      return window.navigator || navigator;
    }
  }

  return false;
};

const isIOS13Check = () => {
  const type = "iPad";
  const nav = getNavigatorInstance();
  return (
    nav &&
    nav.platform &&
    (nav.platform.indexOf(type) !== -1 ||
      (nav.platform === "MacIntel" && nav.maxTouchPoints > 1))
  );
};

const isIOS = os.name === "iOS" || isIOS13Check();
const isMacOs = os.name === "Mac OS";
const isApple = isIOS || isMacOs;

const isControl = (e: KeyboardEvent | MouseEvent): boolean =>
  (e.ctrlKey && !isApple) || (e.metaKey && isApple);

export default isControl;
