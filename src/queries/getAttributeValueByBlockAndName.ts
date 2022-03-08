import normalizePageTitle from "./normalizePageTitle";

const getAttributeValueByBlockAndName = ({
  name,
  uid,
}: {
  name: string;
  uid: string;
}) =>
  (
    window.roamAlphaAPI.q(
      `[:find (pull ?b [:block/string]) :where [?a :node/title "${normalizePageTitle(
        name
      )}"] [?p :block/uid "${uid}"] [?b :block/refs ?a] [?b :block/page ?p]]`
    )?.[0]?.[0]?.string || ""
  )
    .slice(name.length + 2)
    .trim();

export default getAttributeValueByBlockAndName;
