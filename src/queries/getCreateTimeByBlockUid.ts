const getCreateTimeByBlockUid = (uid: string): number =>
  window.roamAlphaAPI.pull(`[:edit/time]`, [":block/uid", uid])?.[
    ":create/time"
  ] || 0;

export default getCreateTimeByBlockUid;
