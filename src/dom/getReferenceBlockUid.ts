import getBlockUidsReferencingBlock from "../queries/getBlockUidsReferencingBlock";
import getDomRefs from "./getDomRefs";
import getUids from "./getUids";

const getReferenceBlockUid = (
  e: HTMLElement,
  className: "rm-block-ref" | "rm-alias--block"
): string => {
  const parent = e.closest(".roam-block") as HTMLDivElement;
  if (!parent) {
    return "";
  }
  const { blockUid } = getUids(parent);
  const childRefs = getBlockUidsReferencingBlock(blockUid);
  const refs = childRefs.length ? childRefs : getDomRefs(blockUid);
  const index = Array.from(parent.getElementsByClassName(className)).findIndex(
    (el) => el === e || el.contains(e)
  );
  return refs[index];
};

export default getReferenceBlockUid;
