const getBlockUidByTextOnPage = ({
  text,
  title,
}: {
  text: string;
  title: string;
}): string =>
  (window.roamAlphaAPI.q(
    `[:find ?u :where [?b :block/page ?p] [?b :block/uid ?u] [?b :block/string "${text}"] [?p :node/title "${title}"]]`
  )?.[0]?.[0] as string) || "";

export default getBlockUidByTextOnPage;
