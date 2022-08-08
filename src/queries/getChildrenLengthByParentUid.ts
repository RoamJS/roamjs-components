const getChildrenLengthByPageUid = (uid: string): number =>
  window.roamAlphaAPI.pull("[:block/children]", [":block/uid", uid])?.[
    ":block/children"
  ]?.length || 0;

export default getChildrenLengthByPageUid;
