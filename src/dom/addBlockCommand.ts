import getChildrenLengthByPageUid from "../queries/getChildrenLengthByPageUid";
import getOrderByBlockUid from "../queries/getOrderByBlockUid";
import getParentUidByBlockUid from "../queries/getParentUidByBlockUid";
import getTextByBlockUid from "../queries/getTextByBlockUid";
import createBlock from "../writes/createBlock";
import updateBlock from "../writes/updateBlock";
import createHTMLObserver from "./createHTMLObserver";
import getCurrentPageUid from "./getCurrentPageUid";
import getUids from "./getUids";

const addBlockCommand = ({
  label,
  callback,
}: {
  label: string;
  callback: (uid: string) => void;
}): void => {
  const textareaRef: { current: HTMLTextAreaElement | null } = {
    current: null,
  };
  const loadBlockUid = (pageUid: string) => {
    if (textareaRef.current) {
      const uid = getUids(textareaRef.current).blockUid;
      const parentUid = getParentUidByBlockUid(uid);
      const text = getTextByBlockUid(uid);
      if (text.length) {
        return createBlock({
          node: { text: "Loading..." },
          parentUid,
          order: getOrderByBlockUid(uid) + 1,
        });
      }
      return updateBlock({
        uid,
        text: "Loading...",
      });
    }
    return createBlock({
      node: { text: "Loading..." },
      parentUid: pageUid,
      order: getChildrenLengthByPageUid(pageUid),
    });
  };
  createHTMLObserver({
    tag: "TEXTAREA",
    className: "rm-block-input",
    callback: (t: HTMLElement) =>
      (textareaRef.current = t as HTMLTextAreaElement),
  });
  window.roamAlphaAPI.ui.commandPalette.addCommand({
    label,
    callback: () => {
      const parentUid = getCurrentPageUid();
      loadBlockUid(parentUid).then(callback);
    },
  });
};

export default addBlockCommand;
