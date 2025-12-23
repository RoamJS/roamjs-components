const getAllPageNames = (): string[] =>
  window.roamAlphaAPI
    .q<[string]>("[:find ?s :where [?e :node/title ?s]]")
    .map((b) => b[0]);

export default getAllPageNames;
