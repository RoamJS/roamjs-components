

const getFirstChildUidByBlockUid = (blockUid: string): string =>
  getNthChildUidByBlockUid({ blockUid, order: 0 });

export default getFirstChildUidByBlockUid;
