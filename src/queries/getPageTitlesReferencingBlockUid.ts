import type { PullBlock } from "../types";

const getPageTitlesReferencingBlockUid = (uid: string): string[] =>
  window.roamAlphaAPI.data.fast
    .q<[PullBlock]>(
      `[:find (pull ?p [:node/title]) :where [?r :block/uid "${uid}"] [?b :block/refs ?r] [?b :block/page ?p]]`
    )
    .map((s) => s[0]?.[":node/title"] || "");

export default getPageTitlesReferencingBlockUid;
