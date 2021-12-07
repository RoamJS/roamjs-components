import getUidsFromId from "../dom/getUidsFromId";

const clearBlockById = (id: string): boolean =>
  window.roamAlphaAPI.updateBlock({
    block: {
      uid: getUidsFromId(id).blockUid,
      string: "",
    },
  });

export default clearBlockById;
