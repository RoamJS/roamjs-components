import normalizePageTitle from "./normalizePageTitle";

const getPageTitlesAndBlockUidsReferencingPage = (
  pageName: string
): { title: string; uid: string }[] =>
  window.roamAlphaAPI
    .q(
      `[:find (pull ?pr [:node/title]) (pull ?r [:block/uid]) :where [?p :node/title "${normalizePageTitle(
        pageName
      )}"] [?r :block/refs ?p] [?r :block/page ?pr]]`
    )
    .map(([{ title }, { uid }]: Record<string, string>[]) => ({ title, uid }));

export default getPageTitlesAndBlockUidsReferencingPage;
