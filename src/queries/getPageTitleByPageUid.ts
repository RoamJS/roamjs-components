export const getPageTitleByPageUid = (blockUid: string): string =>
  window.roamAlphaAPI.q(
    `[:find (pull ?p [:node/title]) :where [?p :block/uid "${blockUid}"]]`
  )?.[0]?.[0]?.title || "";

export default getPageTitleByPageUid;
