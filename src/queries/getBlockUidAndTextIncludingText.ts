import { PullBlock } from "../types";

const getBlockUidAndTextIncludingText = (
  t: string
): { uid: string; text: string }[] =>
  (
    window.roamAlphaAPI.data.fast.q(
      `[:find (pull ?block [:block/uid :block/string]) :where [?block :block/string ?contents] [(clojure.string/includes? ?contents  "${t}")]]`
    ) as [PullBlock][]
  ).map(([block]) => ({
    uid: block[":block/uid"] || "",
    text: block[":block/string"] || "",
  }));

export default getBlockUidAndTextIncludingText;
