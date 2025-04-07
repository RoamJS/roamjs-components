const getAllPageNames = async (): Promise<string[]> => {
  const result = await window.roamAlphaAPI.data.backend.q(
    "[:find ?s :where [?e :node/title ?s]]"
  );
  return result.map((b) => b[0] as string);
};

export default getAllPageNames;
