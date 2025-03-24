const getAllBlockUidsAndTexts = async (): Promise<
  { uid: string; text: string }[]
> =>
  (
    await window.roamAlphaAPI.data.backend.q(
      `[:find ?u ?s :where [?e :block/uid ?u] [?e :block/string ?s]]`
    )
  ).map((f) => ({ uid: f[0] as string, text: f[1] as string }));

export default getAllBlockUidsAndTexts;
