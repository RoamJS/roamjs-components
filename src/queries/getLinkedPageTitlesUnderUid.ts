const getLinkedPageTitlesUnderUid = async (uid: string): Promise<string[]> => {
  const result = await window.roamAlphaAPI.data.backend.q(
    `[:find ?t :where [?r :node/title ?t] [?c :block/refs ?r] [?c :block/parents ?b] [?b :block/uid "${uid}"]]`
  );
  return result.map((r) => r[0] as string);
};

export default getLinkedPageTitlesUnderUid;
