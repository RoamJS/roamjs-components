const getEditTimeByBlockUid = async (uid: string): Promise<number> => {
  const result = await window.roamAlphaAPI.data.pull(`[:edit/time]`, [
    ":block/uid",
    uid,
  ]);
  return result?.[":edit/time"] || 0;
};

export default getEditTimeByBlockUid;
