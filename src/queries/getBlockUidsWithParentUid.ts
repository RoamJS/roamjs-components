const getBlockUidsWithParentUid = async (uid: string): Promise<string[]> => {
  const result = await window.roamAlphaAPI.data.backend.q(
    `[:find ?u :where [?c :block/uid ?u] [?c :block/parents ?b] [?b :block/uid "${uid}"]]`
  );
  return result.map((r) => r[0] as string);
};

export default getBlockUidsWithParentUid;
