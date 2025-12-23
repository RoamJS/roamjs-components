const getBlockUidsWithParentUid = (uid: string): string[] =>
  window.roamAlphaAPI
    .q<[string]>(
      `[:find ?u :where [?c :block/uid ?u] [?c :block/parents ?b] [?b :block/uid "${uid}"]]`
    )
    .map((r) => r[0]);

export default getBlockUidsWithParentUid;
