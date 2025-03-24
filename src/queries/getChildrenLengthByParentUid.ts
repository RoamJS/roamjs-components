const getChildrenLengthByPageUid = async (uid: string): Promise<number> => {
  const result = await window.roamAlphaAPI.data.pull("[:block/children]", [
    ":block/uid",
    uid,
  ]);
  return result?.[":block/children"]?.length || 0;
};

export default getChildrenLengthByPageUid;
