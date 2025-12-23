const getDisplayNameByUid = (uid: string): string =>
  window.roamAlphaAPI.q<[string]>(
    `[:find ?s :where [?e :user/uid "${uid}"] [?e :user/display-page ?p] [?p :node/title ?s]]`
  )?.[0]?.[0] || "";

export default getDisplayNameByUid;
