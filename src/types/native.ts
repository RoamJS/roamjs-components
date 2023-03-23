// emulating Datalog Grammar
// https://docs.datomic.com/cloud/query/query-data-reference.html#or-clauses

import { ChangeEvent } from "react";

export type DatalogSrcVar = {
  type: "src-var";
  value: string;
};

export type DatalogVariable = {
  type: "variable";
  value: string;
};

export type DatalogAndClause = {
  type: "and-clause";
  clauses: DatalogClause[];
};

export type DatalogExpressionClause =
  | DatalogDataPattern
  | DatalogPredExpr
  | DatalogFnExpr
  | DatalogRuleExpr;

export type DatalogRuleExpr = {
  type: "rule-expr";
  srcVar?: DatalogSrcVar;
  ruleName: DatalogRuleName;
  arguments: DatalogArgument[];
};

export type DatalogNotClause = {
  type: "not-clause";
  srcVar?: DatalogSrcVar;
  clauses: DatalogClause[];
};

export type DatalogNotJoinClause = {
  type: "not-join-clause";
  srcVar?: DatalogSrcVar;
  variables: DatalogVariable[];
  clauses: DatalogClause[];
};

export type DatalogOrClause = {
  type: "or-clause";
  srcVar?: DatalogSrcVar;
  clauses: DatalogClause[];
};

export type DatalogOrJoinClause = {
  type: "or-join-clause";
  srcVar?: DatalogSrcVar;
  variables: DatalogVariable[];
  clauses: DatalogClause[];
};

export type DatalogClause =
  | DatalogNotClause
  | DatalogOrJoinClause
  | DatalogExpressionClause
  | DatalogOrClause
  | DatalogNotJoinClause
  | DatalogAndClause;

export type DatalogDataPattern = {
  type: "data-pattern";
  srcVar?: DatalogSrcVar;
  arguments: DatalogArgument[];
};

export type DatalogArgument =
  | DatalogSrcVar
  | DatalogVariable
  | DatalogConstant
  | DatalogUnderscore;

export type DatalogConstant = {
  type: "constant";
  value: string;
};

export type DatalogPredExpr = {
  type: "pred-expr";
  pred:
    | "<"
    | ">"
    | "re-matches"
    | "re-find"
    | "clojure.string/includes?"
    | "clojure.string/ends-with?"
    | "clojure.string/starts-with?";
  arguments: DatalogArgument[];
};

export type DatalogFnExpr = {
  type: "fn-expr";
  fn: "re-pattern";
  arguments: DatalogArgument[];
  binding: DatalogBinding;
};

export type DatalogBinding =
  | DatalogBindScalar
  | DatalogBindTuple
  | DatalogBindColl
  | DatalogBindRel;

export type DatalogBindScalar = {
  type: "bind-scalar";
  variable: DatalogVariable;
};
export type DatalogBindTuple = {
  type: "bind-tuple";
  args: (DatalogVariable | DatalogUnderscore)[];
};
export type DatalogBindColl = {
  type: "bind-col";
  variable: DatalogVariable;
};

export type DatalogBindRel = {
  type: "bind-rel";
  args: (DatalogVariable | DatalogUnderscore)[];
};

export type DatalogUnderscore = {
  type: "underscore";
  value: "_";
};

export type DatalogRuleName = {
  type: "rulename";
  value: string;
};

export type RoamBasicBlock = {
  string: string;
  uid: string;
};

export type RoamBasicPage = { title: string; uid: string };

export type RoamBasicNode = {
  text: string;
  uid: string;
  children: RoamBasicNode[];
};

export type RoamPull = {
  "block/children"?: RoamNode[];
  "block/heading"?: number;
  "block/open"?: boolean;
  "block/order"?: number;
  "block/page"?: RoamNode;
  "block/parents"?: RoamNode[];
  "block/refs"?: RoamNode[];
  "block/string"?: string;
  "block/uid"?: string;
  "children/view-type"?: `:${ViewType}`;
  "create/time"?: number;
  "create/user"?: RoamNode;
  "edit/time"?: number;
  "edit/user"?: RoamNode;
  "log/id"?: number;
  "node/title"?: string;
} & RoamNode;

export type PullBlock = {
  ":block/children"?: ({ ":db/id": number } | PullBlock)[];
  ":block/heading"?: number;
  ":block/open"?: boolean;
  ":block/order"?: number;
  ":block/page"?: { ":db/id": number };
  ":block/parents"?: { ":db/id": number }[];
  ":block/props"?: {
    ":image-size"?: {
      [p: string]: {
        ":height": number;
        ":width": number;
      };
    };
    ":iframe"?: {
      [p: string]: {
        ":size": {
          ":height": number;
          ":width": number;
        };
      };
    };
  };
  ":block/refs"?: { ":db/id": number }[];
  ":block/string"?: string;
  ":block/text-align"?: TextAlignment;
  ":block/uid"?: string;
  ":children/view-type"?: `:${ViewType}`;
  ":create/time"?: number;
  ":create/user"?: { ":db/id": number };
  ":edit/time"?: number;
  ":edit/user"?: { ":db/id": number };
  ":db/id"?: number;
  ":log/id"?: number;
  ":node/title"?: string;
  ":user/display-name"?: string;
  ":user/display-page"?: { ":db/id": number };
  ":user/settings"?: {
    ":namespace-options": [":none", ":partial", ":full"];
    ":link-brackets?": boolean;
    ":showing-inline-references?": boolean;
    ":right-sidebar-pinned": {
      [uuid: string]: SidebarWindow;
    };
    ":showing-own-icons?": boolean;
    ":showing-user-icons?": boolean;
    ":first-day-of-week"?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  };
  ":user/uid"?: string;
};

export type RoamPullResult = RoamPull | null;

export type ViewType = "document" | "bullet" | "numbered";

export type TextAlignment = "left" | "center" | "right" | "justify";

export type RoamBlock = {
  attrs?: { source: string[] }[][];
  children?: { id: number }[];
  id?: number;
  string?: string;
  title?: string;
  time?: number;
  uid?: string;
  order?: number;
  "view-type"?: ViewType;
};

export type RoamError = {
  raw: string;
  "status-code": number;
};

export type TreeNode = {
  text: string;
  order: number;
  children: TreeNode[];
  parents: number[];
  uid: string;
  heading: number;
  open: boolean;
  viewType: ViewType;
  editTime: Date;
  textAlign: TextAlignment;
  props: {
    imageResize: {
      [link: string]: {
        height: number;
        width: number;
      };
    };
    iframe: {
      [link: string]: {
        height: number;
        width: number;
      };
    };
  };
};

export type TextNode = {
  text: string;
  children: TextNode[];
};

export type InputTextNode = {
  text: string;
  children?: InputTextNode[];
  uid?: string;
  heading?: number;
  textAlign?: TextAlignment;
  viewType?: ViewType;
  open?: boolean;
};

type PlusType = [number, string];

export type RoamNode = { "db/id": number };

export type RoamQuery = RoamPull & {
  "block/graph"?: RoamNode;
  "node/graph+title"?: PlusType;
  "block/graph+uid"?: PlusType;
  "node/graph"?: RoamNode;
  "edit/email"?: string;
  "entity/graph"?: RoamNode;
};

export type RoamQueryResult = number & RoamQuery;

export type ClientParams = {
  action:
    | "pull"
    | "q"
    | "create-block"
    | "update-block"
    | "create-page"
    | "move-block"
    | "delete-block"
    | "delete-page"
    | "update-page";
  selector?: string;
  uid?: string;
  query?: string;
  inputs?: string[];
} & ActionParams;

export type ActionParams = {
  location?: {
    "parent-uid": string;
    order: number;
  };
  block?: {
    string?: string;
    uid?: string;
    open?: boolean;
    heading?: number;
    "text-align"?: TextAlignment;
    "children-view-type"?: ViewType;
  };
  page?: {
    title?: string;
    uid?: string;
  };
};

export type WriteAction = (a: ActionParams) => Promise<void>;

export type UserSettings = {
  "global-filters": {
    includes: string[];
    removes: string[];
  };
};

type SidebarWindowType =
  | SidebarBlockWindow
  | SidebarMentionsWindow
  | SidebarGraphWindow
  | SidebarOutlineWindow;

export type SidebarWindowInput = {
  "block-uid": string;
  type: SidebarWindowType["type"];
};

type SidebarBlockWindow = {
  type: "block";
  "block-uid": string;
};

type SidebarOutlineWindow = {
  type: "outline";
  "page-uid": string;
};

type SidebarMentionsWindow = {
  type: "mentions";
  "mentions-uid": string;
};

type SidebarGraphWindow = {
  type: "graph";
  // "page-uid": string; Currently not working despite documentation
  "block-uid": string;
};

export type SidebarAction = (action: {
  window: SidebarWindowInput;
}) => Promise<void>;

export type SidebarWindow = {
  "collapsed?": boolean;
  order: number;
  "pinned?": boolean;
  "window-id": string;
} & SidebarWindowType;

export type AddPullWatch = (
  pullPattern: string,
  entityId: string,
  callback: (before: PullBlock | null, after: PullBlock | null) => void
) => boolean;

type ButtonAction = {
  type: "button";
  onClick?: (e: MouseEvent) => void;
  content: string;
};

type SwitchAction = {
  type: "switch";
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
};

type InputAction = {
  type: "input";
  placeholder: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
};

type SelectAction = {
  type: "select";
  items: string[];
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
};

type CustomAction = {
  type: "reactComponent";
  component: React.FC;
};

export type Action =
  | ButtonAction
  | SwitchAction
  | InputAction
  | SelectAction
  | CustomAction;

type PanelConfig = {
  tabTitle: string;
  settings: {
    id: string;
    name: string;
    description: string;
    action: Action;
  }[];
};

type AddCommandOptions = {
  label: string;
  callback: () => void;
  disableHotkey?: boolean;
  defaultHotkey?: string | string[];
};

export type OnloadArgs = {
  extensionAPI: {
    settings: {
      get: (k: string) => unknown;
      getAll: () => Record<string, unknown>;
      panel: {
        create: (c: PanelConfig) => void;
      };
      set: (k: string, v: unknown) => Promise<void>;
    };
    ui: {
      commandPalette: {
        addCommand: (c: AddCommandOptions) => void;
      };
    };
  };
  extension: {
    version: string;
  };
};
