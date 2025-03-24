import { PullBlock } from "../types";
import normalizePageTitle from "./normalizePageTitle";

const getPageTitlesAndBlockUidsReferencingPage = async (
  pageName: string
): Promise<{ title: string; uid: string }[]> => {
  const result = (await window.roamAlphaAPI.data.backend.q(
    `[:find (pull ?pr [:node/title]) (pull ?r [:block/uid]) :where [?p :node/title "${normalizePageTitle(
      pageName
    )}"] [?r :block/refs ?p] [?r :block/page ?pr]]`
  )) as [PullBlock, PullBlock][];
  return result.map(([pr, r]) => ({
    title: pr?.[":node/title"] || "",
    uid: r?.[":block/uid"] || "",
  }));
};

export default getPageTitlesAndBlockUidsReferencingPage;
