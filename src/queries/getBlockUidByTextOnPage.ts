const getBlockUidByTextOnPage = async ({
  text,
  title,
}: {
  text: string;
  title: string;
}): Promise<string> => {
  const result = await window.roamAlphaAPI.data.backend.q(
    `[:find ?u :where [?b :block/page ?p] [?b :block/uid ?u] [?b :block/string "${text}"] [?p :node/title "${title}"]]`
  );
  return (result?.[0]?.[0] as string) || "";
};

export default getBlockUidByTextOnPage;
