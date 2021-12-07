const getBlockUidAndTextIncludingText = (
  t: string
): { uid: string; text: string }[] =>
  window.roamAlphaAPI
    .q(
      `[:find ?u ?contents :where [?block :block/uid ?u] [?block :block/string ?contents][(clojure.string/includes? ?contents  "${t}")]]`
    )
    .map(([uid, text]: string[]) => ({ uid, text }));

export default getBlockUidAndTextIncludingText;
