const getAllBlockUids = async (): Promise<string[]> =>
  (
    await window.roamAlphaAPI.data.backend.q(
      `[:find ?u :where [?e :block/uid ?u] [?e :block/string]]`
    )
  ).map((f) => f[0] as string);

export default getAllBlockUids;
