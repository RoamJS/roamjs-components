const getBlockUidsReferencingBlock = (uid: string): string[] =>
  window.roamAlphaAPI
    .q(
      `[:find ?u :where [?r :block/uid ?u] [?r :block/refs ?b] [?b :block/uid "${uid}"]]`
    )
    .map((s) => s[0]);

export default getBlockUidsReferencingBlock;
