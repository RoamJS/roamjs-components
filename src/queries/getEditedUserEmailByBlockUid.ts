const getEditedUserEmailByBlockUid = (blockUid: string): string =>
  window.roamAlphaAPI.q<[string]>(
    `[:find ?e :where [?u :user/email ?e] [?b :edit/user ?u] [?b :block/uid "${blockUid}"]]`
  )?.[0]?.[0] || "";

export default getEditedUserEmailByBlockUid;
