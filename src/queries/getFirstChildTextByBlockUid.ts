const getFirstChildTextByBlockUid = async (
  blockUid: string
): Promise<string> => {
  const result = await window.roamAlphaAPI.data.backend.q(
    `[:find ?s :where [?c :block/string ?s] [?c :block/order 0] [?p :block/children ?c] [?p :block/uid "${blockUid}"]]`
  );
  return result?.[0]?.[0] as string;
};

export default getFirstChildTextByBlockUid;
