const deleteBlock = (uid: string): Promise<string> => {
  return window.roamAlphaAPI.deleteBlock({ block: { uid } }).then(() => uid);
};

export default deleteBlock;
