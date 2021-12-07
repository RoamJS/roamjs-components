const getEditedUserEmailByBlockUid = (blockUid: string): string =>
  (window.roamAlphaAPI.q(
    `[:find ?e :where [?u :user/email ?e] [?b :edit/user ?u] [?b :block/uid "${blockUid}"]]`
  )?.[0]?.[0] as string) || "";

export default getEditedUserEmailByBlockUid;
