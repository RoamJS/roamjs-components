const getPageUidByBlockUid = (blockUid: string): string =>
  (
    window.roamAlphaAPI.q(
      `[:find (pull ?p [:block/uid]) :where [?e :block/uid "${blockUid}"] [?e :block/page ?p]]`
    )?.[0]?.[0] as { uid?: string }
  )?.uid || "";

export default getPageUidByBlockUid;
