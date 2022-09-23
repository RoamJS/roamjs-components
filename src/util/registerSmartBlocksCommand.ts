import { RegisterCommand } from "../types/smartblocks";

let unload: () => void;

const registerSmartBlocksCommand: RegisterCommand = (args) => {
  const register = () => {
    if (window.roamjs?.extension.smartblocks) {
      window.roamjs.extension.smartblocks.registerCommand(args);
      unload = () =>
        window.roamjs.extension.smartblocks?.unregisterCommand(args.text);
    }
  };
  if (window.roamjs?.loaded.has("smartblocks")) {
    register();
  } else {
    document.body.addEventListener(`roamjs:smartblocks:loaded`, register);
  }
  return () => {
    unload?.();
  };
};

export default registerSmartBlocksCommand;
