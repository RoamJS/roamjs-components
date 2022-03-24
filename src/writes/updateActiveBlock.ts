import getActiveUids from "../dom/getActiveUids";
import submitActions from "./submitActions";

const updateActiveBlock = (text: string): Promise<void> =>
  submitActions([
    {
      type: "updateBlock",
      params: {
        block: {
          uid: getActiveUids().blockUid,
          string: text,
        },
      },
    },
  ]);

export default updateActiveBlock;
