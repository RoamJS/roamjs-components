import { RegisterCommand } from "../types/smartblocks";

const registerSmartBlocksCommand: RegisterCommand = (args) => {
  if (window.roamjs?.extension?.smartblocks) {
    window.roamjs.extension.smartblocks.registerCommand(args);
  } else {
    document.body.addEventListener(
      `roamjs:smartblocks:loaded`,
      () =>
        window.roamjs?.extension.smartblocks &&
        window.roamjs.extension.smartblocks.registerCommand(args)
    );
  }
};

export default registerSmartBlocksCommand;
