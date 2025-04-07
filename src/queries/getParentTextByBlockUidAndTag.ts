const getParentTextByBlockUidAndTag = async ({
  blockUid,
  tag,
}: {
  blockUid: string;
  tag: string;
}): Promise<string> => {
  const result = await window.roamAlphaAPI.data.backend.q(
    `[:find ?s :where [?t :node/title "${tag}"] [?p :block/refs ?t] [?p :block/string ?s] [?b :block/parents ?p] [?b :block/uid "${blockUid}"]]`
  );
  return (result?.[0]?.[0] as string) || "";
};

export default getParentTextByBlockUidAndTag;
