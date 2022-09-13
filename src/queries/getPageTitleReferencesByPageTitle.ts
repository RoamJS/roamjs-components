import { PullBlock } from "../types";
import normalizePageTitle from "./normalizePageTitle";

const getPageTitleReferencesByPageTitle = (title: string): string[] =>
  (
    window.roamAlphaAPI.data.fast.q(
      `[:find (pull ?b [:node/title]) :where [?r :node/title "${normalizePageTitle(
        title
      )}"] [?c :block/refs ?r] [?c :block/page ?b]]`
    ) as [PullBlock][]
  ).map((p) => p[0][":node/title"] as string);

export default getPageTitleReferencesByPageTitle;
