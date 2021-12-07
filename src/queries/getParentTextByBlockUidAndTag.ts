const getParentTextByBlockUidAndTag = ({
  blockUid,
  tag,
}: {
  blockUid: string;
  tag: string;
}): string =>
  (window.roamAlphaAPI.q(
    `[:find ?s :where [?t :node/title "${tag}"] [?p :block/refs ?t] [?p :block/string ?s] [?b :block/parents ?p] [?b :block/uid "${blockUid}"]]`
  )?.[0]?.[0] as string) || "";

export default getParentTextByBlockUidAndTag;
