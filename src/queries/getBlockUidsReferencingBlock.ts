import { PullBlock } from "../types";

const getBlockUidsReferencingBlock = async (uid: string): Promise<string[]> => {
  const result = (await window.roamAlphaAPI.data.backend.q(
    `[:find (pull ?r [:block/uid]) :where [?b :block/uid "${uid}"] [?r :block/refs ?b]]`
  )) as [PullBlock][];
  return result.map((s) => s[0][":block/uid"] || "");
};

export default getBlockUidsReferencingBlock;
