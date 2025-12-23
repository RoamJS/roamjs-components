const getPageTitleByBlockUid = (blockUid: string): string =>
  window.roamAlphaAPI.q<[{ title: string }]>(
    `[:find (pull ?p [:node/title]) :where [?e :block/uid "${blockUid}"] [?e :block/page ?p]]`
  )?.[0]?.[0]?.title || "";

export default getPageTitleByBlockUid;
