const getChildrenLengthByPageUid = (uid: string): number =>
  window.roamAlphaAPI.q(
    `[:find ?c :where [?e :block/uid "${uid}"] [?e :block/children ?c]]`
  ).length;

export default getChildrenLengthByPageUid;
