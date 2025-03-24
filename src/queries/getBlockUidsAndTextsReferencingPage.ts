import { PullBlock } from "../types";
import normalizePageTitle from "./normalizePageTitle";

const getBlockUidsAndTextsReferencingPage = async (
  title: string
): Promise<{ uid: string; text: string }[]> => {
  const result = (await window.roamAlphaAPI.data.backend.q(
    `[:find (pull ?r [:block/uid :block/string]) :where [?p :node/title "${normalizePageTitle(
      title
    )}"] [?r :block/refs ?p]]`
  )) as [PullBlock][];
  return result.map(([node]) => ({
    uid: node[":block/uid"] || "",
    text: node[":block/string"] || "",
  }));
};

export default getBlockUidsAndTextsReferencingPage;
