const getCreateTimeByBlockUid = async (uid: string): Promise<number> => {
  const result = await window.roamAlphaAPI.data.pull(`[:create/time]`, [
    ":block/uid",
    uid,
  ]);
  return result?.[":create/time"] || 0;
};

export default getCreateTimeByBlockUid;
