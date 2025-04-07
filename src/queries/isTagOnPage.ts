import normalizePageTitle from "./normalizePageTitle";

const isTagOnPage = async ({
  tag,
  title,
}: {
  tag: string;
  title: string;
}): Promise<boolean> => {
  const result = await window.roamAlphaAPI.data.backend.q(
    `[:find ?r :where [?r :node/title "${normalizePageTitle(
      tag
    )}"] [?b :block/refs ?r] [?b :block/page ?p] [?p :node/title "${normalizePageTitle(
      title
    )}"]]`
  );
  return !!result?.[0]?.[0];
};

export default isTagOnPage;
