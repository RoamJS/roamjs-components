import type { PullBlock } from "../types";
import normalizePageTitle from "./normalizePageTitle";

const getPageTitlesAndBlockUidsReferencingPage = (
  pageName: string
): { title: string; uid: string }[] =>
  window.roamAlphaAPI.data.fast
    .q<[PullBlock, PullBlock]>(
      `[:find (pull ?pr [:node/title]) (pull ?r [:block/uid]) :where [?p :node/title "${normalizePageTitle(
        pageName
      )}"] [?r :block/refs ?p] [?r :block/page ?pr]]`
    )
    .map(([pr, r]) => ({
      title: pr[":node/title"] || "",
      uid: r[":block/uid"] || "",
    }));

export default getPageTitlesAndBlockUidsReferencingPage;
