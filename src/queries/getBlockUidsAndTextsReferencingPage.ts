import normalizePageTitle from "./normalizePageTitle";

const getBlockUidsAndTextsReferencingPage = (
  title: string
): { uid: string; text: string }[] =>
  window.roamAlphaAPI
    .q(
      `[:find ?u ?s :where [?r :block/uid ?u] [?r :block/string ?s] [?r :block/refs ?p] [?p :node/title "${normalizePageTitle(
        title
      )}"]]`
    )
    .map(([uid, text]: string[]) => ({ uid, text }));

export default getBlockUidsAndTextsReferencingPage;
