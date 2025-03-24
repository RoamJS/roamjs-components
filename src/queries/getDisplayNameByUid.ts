const getDisplayNameByUid = async (uid: string): Promise<string> => {
  const result = await window.roamAlphaAPI.data.backend.q(
    `[:find ?s :where [?e :user/uid "${uid}"] [?e :user/display-page ?p] [?p :node/title ?s]]`
  );
  return (result?.[0]?.[0] as string) || "";
};

export default getDisplayNameByUid;
