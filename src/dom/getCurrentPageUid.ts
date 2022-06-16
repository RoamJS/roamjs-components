const getCurrentPageUid = (): string =>
  window.location.hash.match(/\/page\/(.*)$/)?.[1] ||
  window.roamAlphaAPI.util.dateToPageUid(new Date());

export default getCurrentPageUid;
