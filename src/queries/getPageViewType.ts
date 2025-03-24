import normalizePageTitle from "./normalizePageTitle";
import type { ViewType } from "../types";

const getPageViewType = async (title: string): Promise<ViewType> => {
  const result = await window.roamAlphaAPI.data.backend.q(
    `[:find ?v :where [?e :children/view-type ?v] [?e :node/title "${normalizePageTitle(
      title
    )}"]]`
  );
  return (result?.[0]?.[0] as ViewType) || "bullet";
};

export default getPageViewType;
