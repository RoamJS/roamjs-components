import type { PullBlock } from "../types";

const getParentUidsOfBlockUid = async (uid: string): Promise<string[]> => {
  const result = (await window.roamAlphaAPI.data.backend.q(
    `[:find (pull ?p [:block/uid]) :where [?b :block/uid "${uid}"] [?b :block/parents ?p] ]`
  )) as [PullBlock][];
  return result.map((r) => r[0][":block/uid"] || "");
};

export default getParentUidsOfBlockUid;
