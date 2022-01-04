import { isIOS, isMacOs } from "mobile-device-detect";

const isApple = isIOS || isMacOs;

const isControl = (e: KeyboardEvent | MouseEvent): boolean =>
  (e.ctrlKey && !isApple) || (e.metaKey && isApple);

export default isControl;