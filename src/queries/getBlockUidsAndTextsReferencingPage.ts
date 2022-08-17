import { PullBlock } from "../types";
import normalizePageTitle from "./normalizePageTitle";

const getBlockUidsAndTextsReferencingPage = (
  title: string
): { uid: string; text: string }[] =>
  (
    window.roamAlphaAPI.data.fast.q(
      `[:find (pull ?r [:block/uid :block/string]) :where [?p :node/title "${normalizePageTitle(
        title
      )}"] [?r :block/refs ?p]]`
    ) as [PullBlock][]
  ).map(([node]) => ({
    uid: node[":block/uid"] || "",
    text: node[":block/string"] || "",
  }));

export default getBlockUidsAndTextsReferencingPage;
