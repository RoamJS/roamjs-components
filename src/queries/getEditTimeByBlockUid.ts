const getEditTimeByBlockUid = (uid: string): number =>
  window.roamAlphaAPI.pull(`[:edit/time]`, [":block/uid", uid])?.[
    ":edit/time"
  ] || 0;

export default getEditTimeByBlockUid;
