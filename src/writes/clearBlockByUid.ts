const clearBlockByUid = (uid: string): boolean =>
  window.roamAlphaAPI.updateBlock({
    block: {
      uid,
      string: "",
    },
  });

export default clearBlockByUid;
