const getDisplayNameByUid = (uid: string): string =>
  (window.roamAlphaAPI.q(
    `[:find ?s :where [?e :user/uid "${uid}"] [?e :user/display-page ?p] [?p :node/title ?s]]`
  )?.[0]?.[0] as string) || "";

export default getDisplayNameByUid;
