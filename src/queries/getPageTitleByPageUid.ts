import { PullBlock } from "../types";

export const getPageTitleByPageUid = async (
  pageUid: string
): Promise<string> => {
  const result = (await window.roamAlphaAPI.data.pull(`[:node/title]`, [
    ":block/uid",
    pageUid,
  ])) as PullBlock;
  return result?.[":node/title"] || "";
};

export default getPageTitleByPageUid;
