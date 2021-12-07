const getPageTitleByBlockUid = (blockUid: string): string =>
  (
    window.roamAlphaAPI.q(
      `[:find (pull ?p [:node/title]) :where [?e :block/uid "${blockUid}"] [?e :block/page ?p]]`
    )?.[0]?.[0] as { title?: string }
  )?.title || "";

export default getPageTitleByBlockUid;
