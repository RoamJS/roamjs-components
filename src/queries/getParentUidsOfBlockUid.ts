const getParentUidsOfBlockUid = (uid: string): string[] =>
  window.roamAlphaAPI
    .q(
      `[:find ?u :where [?p :block/uid ?u] [?b :block/parents ?p] [?b :block/uid "${uid}"]]`
    )
    .map((r) => r[0] as string);

export default getParentUidsOfBlockUid;
