import { InputTextNode } from "./native";

type CommandOutput = string | string[] | InputTextNode[];
export type CommandHandler = (
  ...args: string[]
) => CommandOutput | Promise<CommandOutput>;

export type SmartBlocksContext = {
  onBlockExit: CommandHandler;
  targetUid: string;
  triggerUid: string;
  ifCommand?: boolean;
  exitBlock: "yes" | "no" | "end" | "empty" | "childless";
  exitWorkflow: boolean;
  variables: Record<string, string>;
  cursorPosition?: { uid: string; selection: number };
  currentUid?: string;
  currentContent: string;
  indent: Set<string>;
  unindent: Set<string>;
  focusOnBlock?: string;
  dateBasisMethod?: string;
  refMapping: Record<string, string>;
  afterWorkflowMethods: (() => void | Promise<void>)[];
};

export type RegisterCommand = (args: {
  text: string;
  help?: string;
  handler: (
    c: Pick<SmartBlocksContext, "targetUid" | "variables"> & {
      proccessBlockText: (s: string) => Promise<InputTextNode[]>;
    }
  ) => CommandHandler;
  delayArgs?: true;
}) => () => void;

export type UnregisterCommand = (t: string) => void;
