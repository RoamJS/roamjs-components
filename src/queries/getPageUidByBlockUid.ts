const getPageUidByBlockUid = (blockUid: string): string =>
  window.roamAlphaAPI.q<[{ uid: string }]>(
    `[:find (pull ?p [:block/uid]) :where [?e :block/uid "${blockUid}"] [?e :block/page ?p]]`
  )?.[0]?.[0]?.uid || "";

export default getPageUidByBlockUid;
