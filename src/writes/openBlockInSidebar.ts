const openBlockInSidebar = (blockUid: string): boolean | void =>
  window.roamAlphaAPI.ui.rightSidebar
    .getWindows()
    .some((w) => w.type === "block" && w["block-uid"] === blockUid)
    ? window.roamAlphaAPI.ui.rightSidebar.open()
    : window.roamAlphaAPI.ui.rightSidebar.addWindow({
        window: {
          type: "block",
          "block-uid": blockUid,
        },
      });

export default openBlockInSidebar;
