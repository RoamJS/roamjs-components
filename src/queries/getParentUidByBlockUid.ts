import type { PullBlock } from "../types/native";

const getParentUidByBlockUid = async (blockUid: string): Promise<string> => {
  const result = await window.roamAlphaAPI.data.backend.q(
    `[:find (pull ?p [:block/uid]) :where [?e :block/uid "${blockUid}"] [?p :block/children ?e]]`
  );
  return (result?.[0]?.[0] as PullBlock)?.[":block/uid"] || "";
};

export default getParentUidByBlockUid;
