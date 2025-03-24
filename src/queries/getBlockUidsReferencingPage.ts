import { PullBlock } from "../types";
import normalizePageTitle from "./normalizePageTitle";

const getBlockUidsReferencingPage = async (
  title: string
): Promise<string[]> => {
  const result = (await window.roamAlphaAPI.data.backend.q(
    `[:find (pull ?r [:block/uid]) :where [?p :node/title "${normalizePageTitle(
      title
    )}"] [?r :block/refs ?p]]`
  )) as [PullBlock][];
  return result.map((s) => s[0][":block/uid"] || "");
};

export default getBlockUidsReferencingPage;
