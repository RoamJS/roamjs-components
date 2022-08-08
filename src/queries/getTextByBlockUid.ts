const getTextByBlockUid = (uid = ""): string =>
  (uid &&
    window.roamAlphaAPI.pull("[:block/string]", [":block/uid", uid])?.[
      ":block/string"
    ]) ||
  "";

export default getTextByBlockUid;
