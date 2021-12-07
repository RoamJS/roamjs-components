const getTextByBlockUid = (uid: string): string =>
  (
    window.roamAlphaAPI.q(
      `[:find (pull ?e [:block/string]) :where [?e :block/uid "${uid}"]]`
    )?.[0]?.[0] as { string?: string }
  )?.string || "";

export default getTextByBlockUid;
