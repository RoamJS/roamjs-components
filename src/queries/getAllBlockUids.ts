const getAllBlockUids = (): string[] =>
  window.roamAlphaAPI
    .q<[string]>(`[:find ?u :where [?e :block/uid ?u] [?e :block/string]]`)
    .map((f) => f[0]);

export default getAllBlockUids;
