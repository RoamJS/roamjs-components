import normalizePageTitle from "./normalizePageTitle";

const getBlockUidsByPageTitle = (title: string): string[] =>
  window.roamAlphaAPI
    .q<[string]>(
      `[:find ?u :where  [?b :block/uid ?u] [?b :block/page ?e] [?e :node/title "${normalizePageTitle(
        title
      )}"]]`
    )
    .map((b) => b[0]);

export default getBlockUidsByPageTitle;
