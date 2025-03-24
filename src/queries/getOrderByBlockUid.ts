const getOrderByBlockUid = async (blockUid: string): Promise<number> => {
  const result = await window.roamAlphaAPI.data.backend.q(
    `[:find ?o :where [?r :block/order ?o] [?r :block/uid "${blockUid}"]]`
  );
  return result?.[0]?.[0] as number;
};

export default getOrderByBlockUid;
