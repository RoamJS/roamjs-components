import normalizePageTitle from "./normalizePageTitle";

const getPageTitleReferencesByPageTitle = (title: string): string[] =>
  window.roamAlphaAPI
    .q(
      `[:find ?t :where [?b :node/title ?t] [?b :block/children ?c] [?c :block/refs ?r] [?r :node/title "${normalizePageTitle(
        title
      )}"]]`
    )
    .map((p) => p[0] as string);

export default getPageTitleReferencesByPageTitle;
