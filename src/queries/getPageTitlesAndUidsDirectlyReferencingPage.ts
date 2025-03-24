import { PullBlock } from "../types";
import normalizePageTitle from "./normalizePageTitle";

const getPageTitlesAndUidsDirectlyReferencingPage = async (
  pageName: string
): Promise<{ title: string; uid: string }[]> => {
  const result = (await window.roamAlphaAPI.data.backend.q(
    `[:find (pull ?r [:node/title :block/uid]) :where [?p :node/title "${normalizePageTitle(
      pageName
    )}"] [?r :block/refs ?p]]`
  )) as [PullBlock][];
  return result.map(([block]) => ({
    title: block[":node/title"] || "",
    uid: block[":block/uid"] || "",
  }));
};

export default getPageTitlesAndUidsDirectlyReferencingPage;
