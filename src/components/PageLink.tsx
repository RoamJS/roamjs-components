import React from "react";
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
}>) => (
  <a
    className={"rm-page-ref"}
    data-link-title={getPageTitleByPageUid(uid) || ""}
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
    {children}
  </a>
);

export default PageLink;
