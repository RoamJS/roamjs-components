const getParentTextByBlockUidAndTag = ({
  blockUid,
  tag,
}: {
  blockUid: string;
  tag: string;
}): string =>
  window.roamAlphaAPI.q<[string]>(
    `[:find ?s :where [?t :node/title "${tag}"] [?p :block/refs ?t] [?p :block/string ?s] [?b :block/parents ?p] [?b :block/uid "${blockUid}"]]`
  )?.[0]?.[0] || "";

export default getParentTextByBlockUidAndTag;
