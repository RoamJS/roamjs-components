const getPageTitlesStartingWithPrefix = (prefix: string): string[] =>
  window.roamAlphaAPI
    .q<[string]>(
      `[:find ?title :where [?b :node/title ?title] [(clojure.string/starts-with? ?title  "${prefix}")]]`
    )
    .map((r) => r[0]);

export default getPageTitlesStartingWithPrefix;
