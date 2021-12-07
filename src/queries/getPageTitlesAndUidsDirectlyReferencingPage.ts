import normalizePageTitle from "./normalizePageTitle";

const getPageTitlesAndUidsDirectlyReferencingPage = (
  pageName: string
): { title: string; uid: string }[] =>
  window.roamAlphaAPI
    .q(
      `[:find ?t ?u :where [?r :block/uid ?u] [?r :node/title ?t] [?r :block/refs ?p] [?p :node/title "${normalizePageTitle(
        pageName
      )}"]]`
    )
    .map(([title, uid]: string[]) => ({ title, uid }));

export default getPageTitlesAndUidsDirectlyReferencingPage;
