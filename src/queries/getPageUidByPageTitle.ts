const getPageUidByPageTitle = (title: string): string => {
  if (!title) return "";
  return (
    window.roamAlphaAPI.pull("[:block/uid]", [":node/title", title])?.[
      ":block/uid"
    ] || ""
  );
};

export default getPageUidByPageTitle;
