const getParentTextByBlockUid = (blockUid: string): string =>
  window.roamAlphaAPI.q<[string]>(
    `[:find ?s :where [?e :block/uid "${blockUid}"] [?p :block/children ?e] [?p :block/string ?s]]`
  )?.[0]?.[0] || "";

export default getParentTextByBlockUid;
