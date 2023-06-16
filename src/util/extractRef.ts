import { BLOCK_REF_REGEX } from "../dom/constants";

const extractRef = (ref = ""): string =>
  new RegExp(
    `(?:\\(\\()?${BLOCK_REF_REGEX.source.slice(4, -4)}(?:\\)\\))?`
  ).exec(ref)?.[1] || ref;

export default extractRef;
