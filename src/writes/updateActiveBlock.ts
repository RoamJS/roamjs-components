import getActiveUids from "../dom/getActiveUids";

const updateActiveBlock = (text: string): Promise<void> =>
  window.roamAlphaAPI.updateBlock({
    block: {
      uid: getActiveUids().blockUid,
      string: text,
    },
  });

export default updateActiveBlock;
