const getPageTitlesStartingWithPrefix = (prefix: string): string[] =>
  window.roamAlphaAPI
    .q(
      `[:find ?title :where [?b :node/title ?title] [(clojure.string/starts-with? ?title  "${prefix}")]]`
    )
    .map((r) => r[0] as string);

export default getPageTitlesStartingWithPrefix;
