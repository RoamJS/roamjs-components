import { PullBlock } from "../types";

const getPageTitlesReferencingBlockUid = (uid: string): string[] =>
  (
    window.roamAlphaAPI.data.fast.q(
      `[:find (pull ?p [:node/title]) :where [?r :block/uid "${uid}"] [?b :block/refs ?r] [?b :block/page ?p]]`
    ) as [PullBlock][]
  ).map((s) => s[0]?.[":node/title"] || "");

export default getPageTitlesReferencingBlockUid;
