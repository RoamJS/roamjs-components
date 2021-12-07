const getParentTextByBlockUid = (blockUid: string): string =>
  (window.roamAlphaAPI.q(
    `[:find ?s :where [?e :block/uid "${blockUid}"] [?p :block/children ?e] [?p :block/string ?s]]`
  )?.[0]?.[0] as string) || "";

export default getParentTextByBlockUid;
