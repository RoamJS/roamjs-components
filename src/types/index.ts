import {
  Condition as QueryBuilderCondition,
  Selection as QueryBuilderSelection,
  Result as QueryBuilderResult,
} from "./query-builder";

type CommandOutput = string | string[] | InputTextNode[];
export type CommandHandler = (
  ...args: string[]
) => CommandOutput | Promise<CommandOutput>;

// emulating Datalog Grammar
// https://docs.datomic.com/cloud/query/query-data-reference.html#or-clauses

export type DatalogFnArg = DatalogSrcVar | DatalogVariable | DatalogConstant;

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
  clauses: (DatalogClause | DatalogAndClause)[];
};

export type DatalogOrJoinClause = {
  type: "or-join-clause";
  srcVar?: DatalogSrcVar;
  variables: DatalogVariable[];
  clauses: (DatalogClause | DatalogAndClause)[];
};

export type DatalogClause =
  | DatalogNotClause
  | DatalogOrJoinClause
  | DatalogExpressionClause
  | DatalogOrClause
  | DatalogNotJoinClause;

export type DatalogDataPattern = {
  type: "data-pattern";
  srcVar?: DatalogSrcVar;
  arguments: DatalogArgument[];
};

export type DatalogArgument =
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
    | "re-matches"
    | "clojure.string/includes?"
    | "clojure.string/ends-with?"
    | "clojure.string/starts-with?";
  arguments: DatalogFnArg[];
};

export type DatalogFnExpr = {
  type: "fn-expr";
  fn: DatalogFn;
  arguments: DatalogFnArg[];
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

export type DatalogFn = {
  type: "fn";
  value: string;
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

export type RoamUnorderedBasicNode = {
  text: string;
  uid: string;
  order: number;
  children?: RoamUnorderedBasicNode[];
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
  ":block/children"?: { ":db/id": number }[];
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
  };
  ":user/uid"?: string;
};

export type RoamPullResult = RoamPull | null;

export type ViewType = "document" | "bullet" | "numbered";

export type TextAlignment = "left" | "center" | "right";

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

type json =
  | string
  | number
  | boolean
  | null
  | { toJSON: () => string }
  | json[]
  | { [key: string]: json };

declare global {
  interface Window {
    roamAlphaAPI: {
      q: (
        query: string,
        ...params: unknown[]
      ) => // eslint-disable-next-line @typescript-eslint/no-explicit-any
      any[][];
      pull: (selector: string, id: number | string) => PullBlock;
      createBlock: WriteAction;
      updateBlock: WriteAction;
      createPage: WriteAction;
      moveBlock: WriteAction;
      deleteBlock: WriteAction;
      updatePage: WriteAction;
      deletePage: WriteAction;
      util: {
        generateUID: () => string;
      };
      data: {
        addPullWatch: (
          pullPattern: string,
          entityId: string,
          callback: (before: PullBlock, after: PullBlock) => void
        ) => boolean;
        block: {
          create: WriteAction;
          update: WriteAction;
          move: WriteAction;
          delete: WriteAction;
        };
        fast: {
          q: (query: string, ...params: unknown[]) => unknown[][];
        };
        page: {
          create: WriteAction;
          update: WriteAction;
          delete: WriteAction;
        };
        pull: (selector: string, id: number) => PullBlock;
        pull_many: (pattern: string, eid: string[][]) => PullBlock[];
        q: (query: string, ...params: unknown[]) => unknown[][];
        removePullWatch: (
          pullPattern: string,
          entityId: string,
          callback: (before: PullBlock, after: PullBlock) => void
        ) => boolean;
        redo: () => void;
        undo: () => void;
        user: {
          upsert: () => void;
        };
      };
      ui: {
        leftSidebar: {
          open: () => Promise<void>;
          close: () => Promise<void>;
        };
        rightSidebar: {
          open: () => Promise<void>;
          close: () => Promise<void>;
          getWindows: () => SidebarWindow[];
          addWindow: SidebarAction;
          setWindowOrder: (action: {
            window: SidebarWindowInput & { order: number };
          }) => Promise<void>;
          collapseWindow: SidebarAction;
          pinWindow: SidebarAction;
          expandWindow: SidebarAction;
          removeWindow: SidebarAction;
          unpinWindow: SidebarAction;
        };
        commandPalette: {
          addCommand: (action: { label: string; callback: () => void }) => void;
          removeCommand: (action: { label: string }) => void;
        };
        blockContextMenu: {
          addCommand: (action: {
            label: string;
            callback: (props: {
              "block-string": string;
              "block-uid": string;
              heading: 0 | 1 | 2 | 3 | null;
              "page-uid": string;
              "read-only?": boolean;
              "window-id": string;
            }) => void;
          }) => void;
          removeCommand: (action: { label: string }) => void;
        };
        getFocusedBlock: () => null | {
          "window-id": string;
          "block-uid": string;
        };
        components: {
          renderBlock: (args: { uid: string; el: HTMLElement }) => null;
        };
        mainWindow: {
          openBlock: (p: { block: { uid: string } }) => Promise<void>;
          openPage: (p: {
            page: { uid: string } | { title: string };
          }) => Promise<void>;
          getOpenPageOrBlockUid: () => string;
          openDailyNotes: () => Promise<void>;
        };
        setBlockFocusAndSelection: (a: {
          location?: { "block-uid": string; "window-id": string };
          selection?: { start: number; end?: number };
        }) => Promise<void>;
      };
    };
    roamDatomicAlphaAPI?: (
      params: ClientParams
    ) => Promise<RoamBlock & { success?: boolean }>;
    // roamjs namespace should only be used for methods that must be accessed across extension scripts
    roamjs?: {
      loaded: Set<string>;
      extension: {
        multiplayer?: {
          addGraphListener: (args: {
            operation: string;
            handler: (e: json, graph: string) => void;
          }) => void;
          removeGraphListener: (args: { operation: string }) => void;
          sendToGraph: (args: {
            graph: string;
            operation: string;
            data?: { [k: string]: json };
          }) => void;
          getConnectedGraphs: () => string[];
          getNetworkedGraphs: () => string[];
          enable: () => void;
          disable: () => void;
        };
        queryBuilder?: {
          QueryEditor: (props: {
            parentUid: string;
            onQuery?: () => void;
            defaultReturnNode?: string;
          }) => JSX.Element;
          QueryPage: (props: {
            pageUid: string;
            configUid?: string;
            defaultReturnNode?: string;
          }) => JSX.Element;
          ResultsView: (props: {
            parentUid: string;
            header?: React.ReactNode;
            results: QueryBuilderResult[];
            hideResults?: boolean;
            resultFilter?: (r: QueryBuilderResult) => boolean;
            ctrlClick?: (e: QueryBuilderResult) => void;
            preventSavingSettings?: boolean;
            onEdit?: () => void;
          }) => JSX.Element;
          fireQuery: (query: {
            returnNode: string;
            conditions: QueryBuilderCondition[];
            selections: QueryBuilderSelection[];
          }) => QueryBuilderResult[];
          parseQuery: (q: RoamBasicNode) => {
            returnNode: string;
            conditions: QueryBuilderCondition[];
            selections: QueryBuilderSelection[];
            returnNodeUid: string,
            conditionsNodesUid: string,
            selectionsNodesUid: string,
          };
          conditionToDatalog: (
            condition: QueryBuilderCondition
          ) => DatalogClause[];
          getConditionLabels: () => string[];
          registerDatalogTranslator: (args: {
            key: string;
            callback: (args: {
              source: string;
              target: string;
              uid: string;
            }) => DatalogClause[];
            targetOptions?: string[] | ((source: string) => string[]);
          }) => void;
          unregisterDatalogTranslator: (args: { key: string }) => void;
          registerSelection: (args: {
            test: RegExp;
            pull: (a: { returnNode: string; match: RegExpExecArray }) => string;
            mapper: (r: PullBlock, key: string) => QueryBuilderResult[string];
          }) => void;
        };
        versioning?: {
          switch: (args: { id: string; currentVersion: string }) => void;
        };
        smartblocks?: {
          registerCommand: (args: {
          text: string,
          handler:  (u: unknown) => CommandHandler,
        }) => void
      };
        [id: string]: Record<string, unknown> | undefined;
      };
      version: { [id: string]: string };
      // DEPRECATED remove in 2.0
      dynamicElements: Set<HTMLElement>;
    };
  }
}
