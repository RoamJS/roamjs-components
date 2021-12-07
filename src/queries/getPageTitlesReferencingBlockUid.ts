const getPageTitlesReferencingBlockUid = (uid: string): string[] =>
  window.roamAlphaAPI
    .q(
      `[:find ?t :where [?r :block/uid "${uid}"] [?b :block/refs ?r] [?b :block/page ?p] [?p :node/title ?t]]`
    )
    .map((s) => s[0]);

export default getPageTitlesReferencingBlockUid;
