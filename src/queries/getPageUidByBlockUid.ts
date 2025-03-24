const getPageUidByBlockUid = async (blockUid: string): Promise<string> => {
  const result = await window.roamAlphaAPI.data.backend.q(
    `[:find (pull ?p [:block/uid]) :where [?e :block/uid "${blockUid}"] [?e :block/page ?p]]`
  );
  return (result?.[0]?.[0] as { uid?: string })?.uid || "";
};

export default getPageUidByBlockUid;
