const getParentTextByBlockUid = async (blockUid: string): Promise<string> => {
  const result = await window.roamAlphaAPI.data.backend.q(
    `[:find ?s :where [?e :block/uid "${blockUid}"] [?p :block/children ?e] [?p :block/string ?s]]`
  );
  return (result?.[0]?.[0] as string) || "";
};

export default getParentTextByBlockUid;
