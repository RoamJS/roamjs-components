const getOrderByBlockUid = (blockUid: string): number =>
  window.roamAlphaAPI.q<[number]>(
    `[:find ?o :where [?r :block/order ?o] [?r :block/uid "${blockUid}"]]`
  )?.[0]?.[0];

export default getOrderByBlockUid;
