const getAllBlockUids = (): string[] =>
  window.roamAlphaAPI
    .q(`[:find ?u :where [?e :block/uid ?u] [?e :block/string]]`)
    .map((f) => f[0] as string);

export default getAllBlockUids;
