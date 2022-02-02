import { InputTextNode } from "../types";

type CommandOutput = string | string[] | InputTextNode[];
type CommandHandler = (
  ...args: string[]
) => CommandOutput | Promise<CommandOutput>;
const registerSmartBlocksCommand = ({
  text: inputText,
  handler,
}: {
  text: string;
  handler: (u: unknown) => CommandHandler;
}): void => {
  const text = inputText.toUpperCase();
  const register = (retry: number): void | number | false =>
    window.roamjs?.extension?.smartblocks
      ? window.roamjs.extension.smartblocks.registerCommand({
          text,
          handler,
        })
      : retry === 120 && window.roamjs
      ? !(window.roamjs = {
          ...window.roamjs,
          extension: {
            ...window.roamjs.extension,
            [text]: {
              ...window.roamjs.extension[text],
              registerSmartBlocksCommand: () => {
                window.roamjs?.extension.smartblocks?.registerCommand({
                  text,
                  handler,
                });
              },
            },
          },
        })
      : window.setTimeout(() => register(retry + 1), 1000);
  register(0);
};

export default registerSmartBlocksCommand;
