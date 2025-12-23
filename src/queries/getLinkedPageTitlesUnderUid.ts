const getLinkedPageTitlesUnderUid = (uid: string): string[] =>
  window.roamAlphaAPI
    .q<[string]>(
      `[:find ?t :where [?r :node/title ?t] [?c :block/refs ?r] [?c :block/parents ?b] [?b :block/uid "${uid}"]]`
    )
    .map((r) => r[0]);

export default getLinkedPageTitlesUnderUid;
