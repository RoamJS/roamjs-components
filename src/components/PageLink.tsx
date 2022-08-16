import React, { useMemo } from "react";
import getRoamUrl from "../dom/getRoamUrl";
import getPageTitleByPageUid from "../queries/getPageTitleByPageUid";
import openBlockInSidebar from "../writes/openBlockInSidebar";

const PageLink = ({
  uid,
  onCtrlClick,
  children,
}: React.PropsWithChildren<{
  uid: string;
  onCtrlClick?: (e: React.MouseEvent) => void;
}>) => {
  const title = useMemo(
    () => children || getPageTitleByPageUid(uid),
    [children, uid]
  );
  return (
    <a
      className={"rm-page-ref"}
      data-link-title={title}
      href={getRoamUrl(uid)}
      onMouseDown={(e) => {
        if (e.shiftKey) {
          openBlockInSidebar(uid);
          e.preventDefault();
          e.stopPropagation();
        } else if (e.ctrlKey) {
          onCtrlClick?.(e);
        }
      }}
      onClick={(e) => {
        if (e.shiftKey || e.ctrlKey) {
          e.preventDefault();
          e.stopPropagation();
        }
      }}
      onContextMenu={(e) => {
        if (e.ctrlKey) {
          e.preventDefault();
          e.stopPropagation();
        }
      }}
    >
      {title}
    </a>
  );
};

export default PageLink;
