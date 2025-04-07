const getPageTitleByBlockUid = async (blockUid: string): Promise<string> => {
  const result = await window.roamAlphaAPI.data.backend.q(
    `[:find (pull ?p [:node/title]) :where [?e :block/uid "${blockUid}"] [?e :block/page ?p]]`
  );
  return (result?.[0]?.[0] as { title?: string })?.title || "";
};

export default getPageTitleByBlockUid;
