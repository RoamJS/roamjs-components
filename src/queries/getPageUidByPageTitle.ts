const getPageUidByPageTitle = (title: string): string =>
  window.roamAlphaAPI.pull("[:block/uid]", [":node/title", title])?.[
    ":block/uid"
  ] || "";

export default getPageUidByPageTitle;
