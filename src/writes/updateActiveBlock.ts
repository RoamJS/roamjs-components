import getActiveUids from "../dom/getActiveUids";

const updateActiveBlock = (text: string): boolean =>
  window.roamAlphaAPI.updateBlock({
    block: {
      uid: getActiveUids().blockUid,
      string: text,
    },
  });

export default updateActiveBlock;
