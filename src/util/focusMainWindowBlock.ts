import getCurrentUserUid from "../queries/getCurrentUserUid";
import getPageUidByBlockUid from "../queries/getPageUidByBlockUid";

const focusMainWindowBlock = (uid: string) =>
  window.roamAlphaAPI.ui.setBlockFocusAndSelection({
    location: {
      "block-uid": uid,
      "window-id": `${getCurrentUserUid()}-body-outline-${getPageUidByBlockUid(
        uid
      )}`,
    },
  });
export default focusMainWindowBlock;
