import { PullBlock } from "../types";

const getBlockUidsReferencingBlock = (uid: string): string[] =>
  window.roamAlphaAPI.data.fast
    .q<[PullBlock]>(
      `[:find (pull ?r [:block/uid]) :where [?b :block/uid "${uid}"] [?r :block/refs ?b]]`
    )
    .map((s) => s[0][":block/uid"] || "");

export default getBlockUidsReferencingBlock;
