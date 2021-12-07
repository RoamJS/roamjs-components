const getChildrenLengthByPageUid = (uid: string): number =>
  window.roamAlphaAPI.q(
    `[:find ?c :where [?e :block/children ?c] [?e :block/uid "${uid}"]]`
  ).length;

export default getChildrenLengthByPageUid;
