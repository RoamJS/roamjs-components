const getPageUidByPageTitle = async (title: string): Promise<string> => {
  if (!title) return "";
  return (
    (await window.roamAlphaAPI.pull("[:block/uid]", [":node/title", title]))?.[
      ":block/uid"
    ] || ""
  );
};

export default getPageUidByPageTitle;
