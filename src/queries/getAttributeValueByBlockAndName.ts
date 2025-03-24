import { PullBlock } from "../types";
import normalizePageTitle from "./normalizePageTitle";

const getAttributeValueByBlockAndName = async ({
  name,
  uid,
}: {
  name: string;
  uid: string;
}): Promise<string> => {
  const result = await window.roamAlphaAPI.data.backend.q(
    `[:find (pull ?b [:block/string]) :where [?a :node/title "${normalizePageTitle(
      name
    )}"] [?p :block/uid "${uid}"] [?b :block/refs ?a] [?b :block/parents ?p]]`
  );
  const blockString = (result?.[0]?.[0] as PullBlock)?.[":block/string"] || "";
  return blockString.slice(name.length + 2).trim();
};

export default getAttributeValueByBlockAndName;
