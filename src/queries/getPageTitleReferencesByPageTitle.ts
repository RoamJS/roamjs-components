import type { PullBlock } from "../types";
import normalizePageTitle from "./normalizePageTitle";

const getPageTitleReferencesByPageTitle = (title: string): string[] =>
  window.roamAlphaAPI.data.fast
    .q<[PullBlock]>(
      `[:find (pull ?b [:node/title]) :where [?r :node/title "${normalizePageTitle(
        title
      )}"] [?c :block/refs ?r] [?c :block/page ?b]]`
    )
    .map((p) => p[0][":node/title"] || "");

export default getPageTitleReferencesByPageTitle;
