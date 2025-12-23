const getAllBlockUidsAndTexts = (): { uid: string; text: string }[] =>
  window.roamAlphaAPI
    .q<[string, string]>(
      `[:find ?u ?s :where [?e :block/uid ?u] [?e :block/string ?s]]`
    )
    .map((f) => ({ uid: f[0], text: f[1] }));

export default getAllBlockUidsAndTexts;
