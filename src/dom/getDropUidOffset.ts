import getPageUidByPageTitle from "../queries/getPageUidByPageTitle";
import getPageTitleByHtmlElement from "./getPageTitleByHtmlElement";
import getUids from "./getUids";

const getDropUidOffset = async (
  d: HTMLDivElement
): Promise<{ parentUid: string; offset: number }> => {
  const separator = d.parentElement;
  const childrenContainer = separator?.parentElement;
  const children = Array.from(childrenContainer?.children || []);
  const index = children.findIndex((c) => c === separator);
  const offset = children.reduce(
    (prev, cur, ind) =>
      cur.classList.contains("roam-block-container") && ind < index
        ? prev + 1
        : prev,
    0
  );
  const parentBlock =
    childrenContainer?.previousElementSibling?.getElementsByClassName(
      "roam-block"
    )?.[0] as HTMLDivElement;
  const parentUid = parentBlock
    ? getUids(parentBlock).blockUid
    : childrenContainer
    ? await getPageUidByPageTitle(
        getPageTitleByHtmlElement(childrenContainer)?.textContent || ""
      )
    : "";
  return {
    parentUid,
    offset,
  };
};

export default getDropUidOffset;
