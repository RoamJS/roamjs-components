const isLiveBlock = async (uid: string): Promise<boolean> => {
  const result = await window.roamAlphaAPI.data.pull("[:db/id]", [
    ":block/uid",
    uid,
  ]);
  return !!result;
};

export default isLiveBlock;
