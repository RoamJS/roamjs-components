const getLinkedPageTitlesUnderUid = (uid: string): string[] =>
  window.roamAlphaAPI
    .q(
      `[:find ?t :where [?r :node/title ?t] [?c :block/refs ?r] [?c :block/parents ?b] [?b :block/uid "${uid}"]]`
    )
    .map((r) => r[0] as string);

export default getLinkedPageTitlesUnderUid;
