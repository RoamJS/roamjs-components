export const getPageTitleByPageUid = (pageUid: string): string =>
  window.roamAlphaAPI.pull(`[:node/title]`, [":block/uid", pageUid])?.[
    ":node/title"
  ] || "";

export default getPageTitleByPageUid;
