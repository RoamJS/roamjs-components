const getAllPageNames = (): string[] =>
  window.roamAlphaAPI
    .q("[:find ?s :where [?e :node/title ?s]]")
    .map((b) => b[0] as string);

export default getAllPageNames;
