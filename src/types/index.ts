import type {
  AddPullWatch,
  PullBlock,
  SidebarAction,
  SidebarWindow,
  SidebarWindowInput,
  WriteAction,
  GenericQueryResult,
} from "./native";
import {
  RunQuery,
  ListActiveQueries,
  RunQuerySync,
  IsDiscourseNode,
} from "./query-builder";
import { RegisterCommand, UnregisterCommand } from "./smartblocks";
import type marked from "marked";
import type Markdown from "marked-react";
import type JSZip from "jszip";
import type cytoscape from "cytoscape";
export * from "./native";

export type Registry = {
  elements: HTMLElement[];
  reactRoots: HTMLElement[];
  observers: MutationObserver[];
  domListeners: (
    | {
        el: Window;
        type: keyof WindowEventMap;
        listener: (
          this: Window,
          ev: WindowEventMap[keyof WindowEventMap]
        ) => void;
      }
    | {
        el: Document;
        type: keyof DocumentEventMap;
        listener: (
          this: Document,
          ev: DocumentEventMap[keyof DocumentEventMap]
        ) => void;
      }
    | {
        el: HTMLElement;
        type: keyof HTMLElementEventMap | `roamjs:${string}`;
        listener: (
          this: HTMLElement,
          ev: HTMLElementEventMap[keyof HTMLElementEventMap]
        ) => void;
      }
  )[];
  commands: string[];
  timeouts: { timeout: number }[];
};

declare global {
  interface Window {
    // TODO remove
    RoamLazy?: {
      JSZip: () => Promise<typeof JSZip>;
      Marked: () => Promise<typeof marked>;
      MarkedReact: () => Promise<typeof Markdown>;
      Cytoscape: () => Promise<typeof cytoscape>;
      Insect: () => Promise<{
        // insect uses purescript instead of typescript -.-
        commands: string[];
        fmtConsole: (M: unknown) => unknown;
        fmtJqueryTerminal: (M: unknown) => unknown;
        fmtPlain: (M: unknown) => unknown;
        functions: (M: unknown) => unknown;
        identifiers: (M: unknown) => unknown;
        initialEnvironment: { values: unknown; functions: unknown };
        repl: (
          fmt: (M: unknown) => unknown
        ) => (env: {
          values: unknown;
          functions: unknown;
        }) => (s: string) => { msg: string };
      }>;
    };
    // END TODO remove

    roamAlphaAPI: {
      q: (query: string, ...params: unknown[]) => GenericQueryResult;
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
        uploadFile: (args: { file: File }) => string;
      };
      data: {
        addPullWatch: AddPullWatch;
        block: {
          create: WriteAction;
          update: WriteAction;
          move: WriteAction;
          delete: WriteAction;
          reorderBlocks: (args: {
            location: { "parent-uid": string };
            blocks: string[];
          }) => Promise<void>;
        };
        fast: {
          q: (query: string, ...params: unknown[]) => GenericQueryResult;
        };
        async: {
          q: (
            query: string,
            ...params: unknown[]
          ) => Promise<GenericQueryResult>;
          pull: (
            selector: string,
            id: number | string | [string, string]
          ) => Promise<PullBlock>;
          pull_many: (
            pattern: string,
            eids: string[][]
          ) => Promise<PullBlock[]>;
          fast: {
            q: (
              query: string,
              ...params: unknown[]
            ) => Promise<GenericQueryResult>;
          };
        };
        backend: {
          q: (
            query: string,
            ...params: unknown[]
          ) => Promise<GenericQueryResult>;
        };
        page: {
          create: WriteAction;
          update: WriteAction;
          delete: WriteAction;
        };
        pull: (
          selector: string,
          id: number | string | [string, string]
        ) => PullBlock;
        pull_many: (pattern: string, eids: string[][]) => PullBlock[];
        q: (query: string, ...params: unknown[]) => GenericQueryResult;
        removePullWatch: (
          pullPattern: string,
          entityId: string,
          callback?: (before: PullBlock, after: PullBlock) => void
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
          setWindowOrder: SidebarAction;
          collapseWindow: SidebarAction;
          pinWindow: (action: {
            window: SidebarWindowInput;
            "pin-to-top?"?: boolean;
          }) => Promise<void>;
          expandWindow: SidebarAction;
          removeWindow: SidebarAction;
          unpinWindow: SidebarAction;
        };
        commandPalette: {
          addCommand: (action: {
            label: string;
            callback: () => void;
            "disable-hotkey"?: boolean;
            "default-hotkey"?: string | string[];
          }) => Promise<void>;
          removeCommand: (action: { label: string }) => Promise<void>;
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
        individualMultiselect: {
          getSelectedUids: () => string[];
        };
        msContextMenu: {
          addCommand: (action: {
            label: string;
            callback: () => void;
            "display-conditional"?: () => boolean;
          }) => void;
          removeCommand: (action: { label: string }) => void;
        };
        filters: {
          addGlobalFilter: (args: {
            title: string;
            type: "includes" | "removes";
          }) => Promise<void>;
          removeGlobalFilter: (args: {
            title: string;
            type: "includes" | "removes";
          }) => Promise<void>;
          getGlobalFilters: () => { includes: string[]; removes: string[] };
          getPageFilters: (args: {
            page: { uid?: string; title?: string };
          }) => {
            includes: string[];
            removes: string[];
          };
          getPageLinkedRefsFilters: (args: {
            page: { uid?: string; title?: string };
          }) => {
            includes: string[];
            removes: string[];
          };
          getSidebarWindowFilters: (args: { window: SidebarWindowInput }) => {
            includes: string[];
            removes: string[];
          };
          setPageFilters: (args: {
            page: { uid?: string; title?: string };
            filters: { includes?: string[]; removes?: string[] };
          }) => Promise<void>;
          setPageLinkedRefsFilters: (args: {
            page: { uid?: string; title?: string };
            filters: { includes?: string[]; removes?: string[] };
          }) => Promise<void>;
          setSidebarWindowFilters: (args: {
            window: SidebarWindowInput;
            filters: { includes?: string[]; removes?: string[] };
          }) => Promise<void>;
        };
        getFocusedBlock: () => null | {
          "window-id": string;
          "block-uid": string;
        };
        components: {
          renderBlock: (args: {
            uid: string;
            el: HTMLElement;
            "zoom-path?"?: boolean;
            // "open?"?: boolean; Not available yet in the API
          }) => null;
          renderPage: (args: {
            uid: string;
            el: HTMLElement;
            "hide-mentions?"?: boolean;
          }) => null;
          renderSearch: (args: {
            "search-query-str": string;
            el: HTMLElement;
            "closed?"?: boolean;
            "group-by-page?"?: boolean;
            "hide-paths?"?: boolean;
            "config-changed-callback"?: (config: unknown) => void;
          }) => null;
          // renderString: (args: { string: string; el: HTMLElement }) => null; Not available yet in the API
          unmountNode: (args: { el: HTMLElement }) => void;
        };
        graphView: {
          addCallback: (props: {
            label: string;
            callback: (context: {
              cytoscape: unknown;
              elements: unknown[];
              type: "page" | "all-pages";
            }) => void;
            type?: "page" | "all-pages";
          }) => Promise<void>;
          removeCallback: (props: { label: string }) => Promise<void>;
          wholeGraph: {
            addCallback: (props: {
              label: string;
              callback: (arg: { "sigma-renderer": unknown }) => void;
            }) => any;
            removeCallback: (props: { label: string }) => void;
            setExplorePages: (pages: string[]) => void;
            getExplorePages: () => string[];
            setMode: (mode: "Whole Graph" | "Explore") => void;
          };
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
      file: {
        upload: (args: {
          file: File;
          toast?: { hide: boolean };
        }) => Promise<string>;
        get: (args: { url: string }) => Promise<File>;
        delete: (args: { url: string }) => Promise<void>;
      };
      user: {
        uid: () => string | null;
      };
      constants: {
        corsAnywhereProxyUrl: string;
      };
    };

    // roamjs namespace should only be used for methods that must be accessed across extension scripts
    roamjs: {
      loaded: Set<string>;
      extension: {
        queryBuilder?: {
          runQuery: RunQuery;
          runQuerySync: RunQuerySync;
          listActiveQueries: ListActiveQueries;
          isDiscourseNode: IsDiscourseNode;
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
