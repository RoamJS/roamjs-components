import normalizePageTitle from "./normalizePageTitle";
import type { ViewType } from "../types";

const getPageViewType = (title: string): ViewType =>
  window.roamAlphaAPI.q<[ViewType]>(
    `[:find ?v :where [?e :children/view-type ?v] [?e :node/title "${normalizePageTitle(
      title
    )}"]]`
  )?.[0]?.[0] || "bullet";

export default getPageViewType;
