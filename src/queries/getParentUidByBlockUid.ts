import type { PullBlock } from "../types/native";

const getParentUidByBlockUid = (blockUid: string): string =>
  (
    window.roamAlphaAPI.data.fast.q(
      `[:find (pull ?p [:block/uid]) :where [?e :block/uid "${blockUid}"] [?p :block/children ?e]]`
    )?.[0]?.[0] as PullBlock
  )?.[":block/uid"] || "";

export default getParentUidByBlockUid;
