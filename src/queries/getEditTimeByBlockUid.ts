const getEditTimeByBlockUid = (uid: string): number =>
  window.roamAlphaAPI.q(
    `[:find ?t :where [?e :edit/time ?t] [?e :block/uid "${uid}"]]`
  )?.[0]?.[0] as number;

export default getEditTimeByBlockUid;
