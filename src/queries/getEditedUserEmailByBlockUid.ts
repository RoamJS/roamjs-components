const getEditedUserEmailByBlockUid = async (
  blockUid: string
): Promise<string> => {
  const result = await window.roamAlphaAPI.data.backend.q(
    `[:find ?e :where [?u :user/email ?e] [?b :edit/user ?u] [?b :block/uid "${blockUid}"]]`
  );
  return (result?.[0]?.[0] as string) || "";
};

export default getEditedUserEmailByBlockUid;
