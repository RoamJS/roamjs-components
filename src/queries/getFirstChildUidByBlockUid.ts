import getNthChildUidByBlockUid from "./getNthChildUidByBlockUid";

const getFirstChildUidByBlockUid = async (blockUid: string): Promise<string> =>
  await getNthChildUidByBlockUid({ blockUid, order: 0 });

export default getFirstChildUidByBlockUid;
