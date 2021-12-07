import normalizePageTitle from "./normalizePageTitle";

const getBlockUidsReferencingPage = (title: string): string[] =>
  window.roamAlphaAPI
    .q(
      `[:find ?u :where [?r :block/uid ?u] [?r :block/refs ?p] [?p :node/title "${normalizePageTitle(
        title
      )}"]]`
    )
    .map((s) => s[0]);

export default getBlockUidsReferencingPage;
