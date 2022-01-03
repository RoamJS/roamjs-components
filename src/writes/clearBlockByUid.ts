const clearBlockByUid = (uid: string): Promise<void> =>
  window.roamAlphaAPI.updateBlock({
    block: {
      uid,
      string: "",
    },
  });

export default clearBlockByUid;
