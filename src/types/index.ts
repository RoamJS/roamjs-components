import {
  AddPullWatch,
  DatalogClause,
  PullBlock,
  RoamBasicNode,
  SidebarAction,
  SidebarWindow,
  SidebarWindowInput,
  WriteAction,
} from "./native";
import {
  Condition as QueryBuilderCondition,
  Selection as QueryBuilderSelection,
  Result as QueryBuilderResult,
  ExportTypes,
  QBResultsView,
} from "./query-builder";
import { RegisterCommand, UnregisterCommand } from "./smartblocks";
import type marked from "marked";
import type Markdown from "marked-react";
import type JSZip from "jszip";
export * from "./native";

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
    // TODO remove
    RoamLazy?: {
      JSZip: () => Promise<typeof JSZip>;
      Marked: () => Promise<typeof marked>;
      MarkedReact: () => Promise<typeof Markdown>;
    };
    // END TODO remove

    roamAlphaAPI: {
      q: (
        query: string,
        ...params: unknown[]
      ) => // eslint-disable-next-line @typescript-eslint/no-explicit-any
      any[][];
      pull: (
        selector: string,
        id: number | string | [string, string]
      ) => PullBlock;
      createBlock: WriteAction;
      updateBlock: WriteAction;
      createPage: WriteAction;
      moveBlock: WriteAction;
      deleteBlock: WriteAction;
      updatePage: WriteAction;
      deletePage: WriteAction;
      util: {
        generateUID: () => string;
        dateToPageTitle: (date: Date) => string;
        dateToPageUid: (date: Date) => string;
        pageTitleToDate: (title: string) => Date | null;
        uploadFile: (title: string) => Date;
      };
      data: {
        addPullWatch: AddPullWatch;
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
        pull: (selector: string, id: number | string | [string, string]) => PullBlock;
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
          focusFirstBlock: () => Promise<void>;
          openBlock: (p: { block: { uid: string } }) => Promise<void>;
          openPage: (p: {
            page: { uid: string } | { title: string };
          }) => Promise<void>;
          getOpenPageOrBlockUid: () => Promise<string | null>;
          openDailyNotes: () => Promise<void>;
        };
        setBlockFocusAndSelection: (a: {
          location?: { "block-uid": string; "window-id": string };
          selection?: { start: number; end?: number };
        }) => Promise<void>;
      };
      platform: {
        isDesktop: boolean;
        isIOS: boolean;
        isMobile: boolean;
        isMobileApp: boolean;
        isPC: boolean;
        isTouchDevice: boolean;
      };
      graph: {
        name: string;
        type: "hosted" | "offline";
        isEncrypted: boolean;
      };
    };

    // roamjs namespace should only be used for methods that must be accessed across extension scripts
    roamjs: {
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
          ExportDialog: (props: {
            onClose: () => void;
            isOpen: boolean;
            exportTypes: ExportTypes;
            results: QueryBuilderResult[];
          }) => JSX.Element;
          QueryEditor: (props: {
            parentUid: string;
            onQuery?: () => void;
            defaultReturnNode?: string;
          }) => JSX.Element;
          QueryPage: (props: {
            pageUid: string;
            configUid?: string;
            defaultReturnNode?: string;
            getExportTypes?: (r: QueryBuilderResult[]) => ExportTypes;
          }) => JSX.Element;
          ResultsView: QBResultsView;
          fireQuery: (query: {
            returnNode: string;
            conditions: QueryBuilderCondition[];
            selections: QueryBuilderSelection[];
          }) => Promise<QueryBuilderResult[]>;
          parseQuery: (q: RoamBasicNode) => {
            returnNode: string;
            conditions: QueryBuilderCondition[];
            selections: QueryBuilderSelection[];
            returnNodeUid: string;
            conditionsNodesUid: string;
            selectionsNodesUid: string;
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
            pull: (a: {
              returnNode: string;
              match: RegExpExecArray;
              where: DatalogClause[];
            }) => string;
            mapper: (
              r: PullBlock,
              key: string
            ) =>
              | QueryBuilderResult[string]
              | Record<string, QueryBuilderResult[string]>
              | Promise<
                  | QueryBuilderResult[string]
                  | Record<string, QueryBuilderResult[string]>
                >;
          }) => void;
        };
        versioning?: {
          switch: (args: { id: string; currentVersion: string }) => void;
        };
        smartblocks?: {
          registerCommand: RegisterCommand;
          unregisterCommand: UnregisterCommand;
          triggerSmartblock: (args: {
            srcName?: string;
            srcUid?: string;
            targetName?: string;
            targetUid?: string;
            variables?: Record<string, string>;
          }) => Promise<unknown>;
        };
        [id: string]: Record<string, unknown> | undefined;
      };
      version: { [id: string]: string };
      actions: Record<string, number>;
    };
  }
}
