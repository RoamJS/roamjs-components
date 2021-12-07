import getNthChildUidByBlockUid from "../queries/getNthChildUidByBlockUid";
import getReferenceBlockUid from "./getReferenceBlockUid";
import getUids from "./getUids";

const getBlockUidFromTarget = (target: HTMLElement): string => {
  const ref = target.closest(".rm-block-ref") as HTMLSpanElement;
  if (ref) {
    return ref.getAttribute("data-uid") || "";
  }

  const customView = target.closest(".roamjs-block-view") as HTMLDivElement;
  if (customView) {
    return getUids(customView).blockUid;
  }

  const aliasTooltip = target.closest(".rm-alias-tooltip__content");
  if (aliasTooltip) {
    const aliasRef = document.querySelector(
      ".bp3-popover-open .rm-alias--block"
    ) as HTMLAnchorElement;
    return getReferenceBlockUid(aliasRef, "rm-alias--block");
  }

  const { blockUid } = getUids(target.closest(".roam-block") as HTMLDivElement);
  const kanbanTitle = target.closest(".kanban-title");
  if (kanbanTitle) {
    const container = kanbanTitle.closest(".kanban-column-container");
    if (container) {
      const column = kanbanTitle.closest(".kanban-column");
      const order = Array.from(container.children).findIndex(
        (d) => d === column
      );
      return getNthChildUidByBlockUid({ blockUid, order });
    }
  }
  return blockUid;
}

export default getBlockUidFromTarget;
