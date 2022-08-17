import { PullBlock } from "../types";

const getBlockUidsReferencingBlock = (uid: string): string[] =>
  (
    window.roamAlphaAPI.data.fast.q(
      `[:find (pull ?r [:block/uid]) :where [?b :block/uid "${uid}"] [?r :block/refs ?b]]`
    ) as [PullBlock][]
  ).map((s) => s[0][":block/uid"] || "");

export default getBlockUidsReferencingBlock;
