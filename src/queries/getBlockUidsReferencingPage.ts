import { PullBlock } from "../types";
import normalizePageTitle from "./normalizePageTitle";

const getBlockUidsReferencingPage = (title: string): string[] =>
  window.roamAlphaAPI.data.fast
    .q<[PullBlock]>(
      `[:find (pull ?r [:block/uid]) :where [?p :node/title "${normalizePageTitle(
        title
      )}"] [?r :block/refs ?p]]`
    )
    .map((s) => s[0][":block/uid"] || "");

export default getBlockUidsReferencingPage;
