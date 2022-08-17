import { PullBlock } from "../types";

export const getPageTitleByPageUid = (pageUid: string): string =>
  (
    window.roamAlphaAPI.pull(`[:node/title]`, [
      ":block/uid",
      pageUid,
    ]) as PullBlock
  )?.[":node/title"] || "";

export default getPageTitleByPageUid;
