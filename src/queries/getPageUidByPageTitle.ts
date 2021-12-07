import normalizePageTitle from "./normalizePageTitle";

const getPageUidByPageTitle = (title: string): string =>
  (
    window.roamAlphaAPI.q(
      `[:find (pull ?e [:block/uid]) :where [?e :node/title "${normalizePageTitle(
        title
      )}"]]`
    )?.[0]?.[0] as { uid?: string }
  )?.uid || "";

export default getPageUidByPageTitle;
