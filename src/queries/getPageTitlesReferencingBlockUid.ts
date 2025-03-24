import { PullBlock } from "../types";

const getPageTitlesReferencingBlockUid = async (
  uid: string
): Promise<string[]> => {
  const result = (await window.roamAlphaAPI.data.backend.q(
    `[:find (pull ?p [:node/title]) :where [?r :block/uid "${uid}"] [?b :block/refs ?r] [?b :block/page ?p]]`
  )) as [PullBlock][];
  return result.map((s) => s[0]?.[":node/title"] || "");
};

export default getPageTitlesReferencingBlockUid;
