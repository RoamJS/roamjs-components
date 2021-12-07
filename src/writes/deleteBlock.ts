const deleteBlock = (uid: string): string => {
  window.roamAlphaAPI.deleteBlock({ block: { uid } });
  return uid;
};

export default deleteBlock;
