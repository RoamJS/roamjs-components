const getTextByBlockUid = async (uid = ""): Promise<string> => {
  if (!uid) return "";
  const result = await window.roamAlphaAPI.data.pull("[:block/string]", [
    ":block/uid",
    uid,
  ]);
  return result?.[":block/string"] || "";
};

export default getTextByBlockUid;
