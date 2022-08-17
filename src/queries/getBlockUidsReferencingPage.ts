import { PullBlock } from "../types";
import normalizePageTitle from "./normalizePageTitle";

const getBlockUidsReferencingPage = (title: string): string[] =>
  (
    window.roamAlphaAPI.data.fast.q(
      `[:find (pull ?r [:block/uid]) :where [?p :node/title "${normalizePageTitle(
        title
      )}"] [?r :block/refs ?p]]`
    ) as [PullBlock][]
  ).map((s) => s[0][":block/uid"] || "");

export default getBlockUidsReferencingPage;
