import normalizePageTitle from "./normalizePageTitle";

const getBlockUidsAndTextsReferencingPage = (
  title: string
): { uid: string; text: string }[] =>
  window.roamAlphaAPI
    .q(
      `[:find (pull ?r [:block/uid :block/string]) :where [?p :node/title "${normalizePageTitle(
        title
      )}"] [?r :block/refs ?p]]`
    )
    .map(([node]: Record<string, string>[]) => ({
      uid: node.uid,
      text: node.string || '',
    }));

export default getBlockUidsAndTextsReferencingPage;
