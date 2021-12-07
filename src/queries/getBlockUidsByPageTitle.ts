import normalizePageTitle from "./normalizePageTitle";

const getBlockUidsByPageTitle = (title: string): string[] =>
  window.roamAlphaAPI
    .q(
      `[:find ?u :where  [?b :block/uid ?u] [?b :block/page ?e] [?e :node/title "${normalizePageTitle(
        title
      )}"]]`
    )
    .map((b) => b[0] as string);

export default getBlockUidsByPageTitle;
