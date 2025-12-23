import type { PullBlock } from "../types";

const getParentUidsOfBlockUid = (uid: string): string[] =>
  window.roamAlphaAPI.data.fast
    .q<[PullBlock]>(
      `[:find (pull ?p [:block/uid]) :where [?b :block/uid "${uid}"] [?b :block/parents ?p] ]`
    )
    .map((r) => r[0][":block/uid"] || "");

export default getParentUidsOfBlockUid;
