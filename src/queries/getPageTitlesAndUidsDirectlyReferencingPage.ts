import { PullBlock } from "../types";
import normalizePageTitle from "./normalizePageTitle";

const getPageTitlesAndUidsDirectlyReferencingPage = (
  pageName: string
): { title: string; uid: string }[] =>
  (
    window.roamAlphaAPI.data.fast.q(
      `[:find (pull ?r [:node/title :block/uid]) :where [?p :node/title "${normalizePageTitle(
        pageName
      )}"] [?r :block/refs ?p]]`
    ) as [PullBlock][]
  ).map(([block]) => ({
    title: block[":node/title"] || "",
    uid: block[":block/uid"] || "",
  }));

export default getPageTitlesAndUidsDirectlyReferencingPage;
