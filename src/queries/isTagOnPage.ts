import normalizePageTitle from "./normalizePageTitle";

const isTagOnPage = ({ tag, title }: { tag: string; title: string }): boolean =>
  !!window.roamAlphaAPI.q<[number]>(
    `[:find ?r :where [?r :node/title "${normalizePageTitle(
      tag
    )}"] [?b :block/refs ?r] [?b :block/page ?p] [?p :node/title "${normalizePageTitle(
      title
    )}"]]`
  )?.[0]?.[0];

export default isTagOnPage;
