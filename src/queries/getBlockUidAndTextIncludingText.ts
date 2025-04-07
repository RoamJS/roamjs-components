import { PullBlock } from "../types";

const getBlockUidAndTextIncludingText = async (
  t: string
): Promise<{ uid: string; text: string }[]> => {
  const result = (await window.roamAlphaAPI.data.backend.q(
    `[:find (pull ?block [:block/uid :block/string]) :where [?block :block/string ?contents] [(clojure.string/includes? ?contents  "${t}")]]`
  )) as [PullBlock][];
  return result.map(([block]) => ({
    uid: block[":block/uid"] || "",
    text: block[":block/string"] || "",
  }));
};

export default getBlockUidAndTextIncludingText;
