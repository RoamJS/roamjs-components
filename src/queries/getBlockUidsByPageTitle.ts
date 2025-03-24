import normalizePageTitle from "./normalizePageTitle";

const getBlockUidsByPageTitle = async (title: string): Promise<string[]> => {
  const result = await window.roamAlphaAPI.data.backend.q(
    `[:find ?u :where  [?b :block/uid ?u] [?b :block/page ?e] [?e :node/title "${normalizePageTitle(
      title
    )}"]]`
  );
  return result.map((b) => b[0] as string);
};

export default getBlockUidsByPageTitle;
