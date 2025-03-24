const getPageTitlesStartingWithPrefix = async (
  prefix: string
): Promise<string[]> => {
  const result = await window.roamAlphaAPI.data.backend.q(
    `[:find ?title :where [?b :node/title ?title] [(clojure.string/starts-with? ?title  "${prefix}")]]`
  );
  return result.map((r) => r[0] as string);
};

export default getPageTitlesStartingWithPrefix;
