const getDisplayNameByUid = (uid: string): string =>
  (window.roamAlphaAPI.q(
    `[:find ?s :where [?p :node/title ?s] [?e :user/display-page ?p] [?e :user/uid "${uid}"]]`
  )?.[0]?.[0] as string) || "";

export default getDisplayNameByUid;
