const getFirstChildTextByBlockUid = (blockUid: string): string =>
  window.roamAlphaAPI.q<[string]>(
    `[:find ?s :where [?c :block/string ?s] [?c :block/order 0] [?p :block/children ?c] [?p :block/uid "${blockUid}"]]`
  )?.[0]?.[0];

export default getFirstChildTextByBlockUid;
