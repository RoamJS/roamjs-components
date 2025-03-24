import { PullBlock } from "../types";
import normalizePageTitle from "./normalizePageTitle";

const getPageTitleReferencesByPageTitle = async (
  title: string
): Promise<string[]> => {
  const result = (await window.roamAlphaAPI.data.backend.q(
    `[:find (pull ?b [:node/title]) :where [?r :node/title "${normalizePageTitle(
      title
    )}"] [?c :block/refs ?r] [?c :block/page ?b]]`
  )) as [PullBlock][];
  return result.map((p) => p[0][":node/title"] as string);
};

export default getPageTitleReferencesByPageTitle;
