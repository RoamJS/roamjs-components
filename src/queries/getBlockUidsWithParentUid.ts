

const getBlockUidsWithParentUid = (uid: string): string[] =>
  window.roamAlphaAPI
    .q(
      `[:find ?u :where [?c :block/uid ?u] [?c :block/parents ?b] [?b :block/uid "${uid}"]]`
    )
    .map((r) => r[0] as string);

export default getBlockUidsWithParentUid;
