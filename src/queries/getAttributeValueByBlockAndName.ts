import { PullBlock } from "../types";
import normalizePageTitle from "./normalizePageTitle";

const getAttributeValueByBlockAndName = ({
  name,
  uid,
}: {
  name: string;
  uid: string;
}) =>
  (
    (
      window.roamAlphaAPI.data.fast.q(
        `[:find (pull ?b [:block/string]) :where [?a :node/title "${normalizePageTitle(
          name
        )}"] [?p :block/uid "${uid}"] [?b :block/refs ?a] [?b :block/parents ?p]]`
      )?.[0]?.[0] as PullBlock
    )?.[":block/string"] || ""
  )
    .slice(name.length + 2)
    .trim();

export default getAttributeValueByBlockAndName;
