import {
  AddPullWatch,
  AiToolApi,
  BlockContext,
  BlockRefContext,
  ContextMenu,
  CreateBlockArgs,
  CreatePageArgs,
  DeleteBlockArgs,
  DeletePageArgs,
  FocusedBlock,
  OpenMainWindowView,
  PageContext,
  PageLinkContext,
  PageRefContext,
  PullBlock,
  PullEntityId,
  PullOptions,
  RoamQueryArgs,
  RoamQueryResponse,
  SearchArgs,
  SemanticSearch,
  SidebarAction,
  SidebarFilterWindowInput,
  SidebarWindow,
  SidebarWindowInput,
  SlashCommandApi,
  MoveBlockArgs,
  UpdateBlockArgs,
  UpdatePageArgs,
  WriteApi,
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
          ev: WindowEventMap[keyof WindowEventMap],
        ) => void;
      }
    | {
        el: Document;
        type: keyof DocumentEventMap;
        listener: (
          this: Document,
          ev: DocumentEventMap[keyof DocumentEventMap],
        ) => void;
      }
    | {
        el: HTMLElement;
        type: keyof HTMLElementEventMap | `roamjs:${string}`;
        listener: (
          this: HTMLElement,
          ev: HTMLElementEventMap[keyof HTMLElementEventMap],
        ) => void;
      }
  )[];
  commands: string[];
  timeouts: { timeout: number }[];
};

export type InstalledExtension = {
  id: string;
  name: string;
  enabled: boolean;
  adminEnabled: boolean;
  version: string;
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
          fmt: (M: unknown) => unknown,
        ) => (env: {
          values: unknown;
          functions: unknown;
        }) => (s: string) => { msg: string };
      }>;
    };
    // END TODO remove

    roamAlphaAPI: {
      apiVersion: string;
      q: (query: string, ...params: unknown[]) => unknown[][];
      pull: (
        selector: string,
        id: PullEntityId,
        options?: PullOptions,
      ) => PullBlock;
      createBlock: WriteApi<CreateBlockArgs>;
      updateBlock: WriteApi<UpdateBlockArgs>;
      createPage: WriteApi<CreatePageArgs>;
      moveBlock: WriteApi<MoveBlockArgs>;
      deleteBlock: WriteApi<DeleteBlockArgs>;
      updatePage: WriteApi<UpdatePageArgs>;
      deletePage: WriteApi<DeletePageArgs>;
      util: {
        generateUID: () => string;
        dateToPageTitle: (date: Date) => string;
        dateToPageUid: (date: Date) => string;
        pageTitleToDate: (title: string) => Date | null;
        uploadFile: (args: { file: File }) => Promise<string>;
      };
      data: {
        addPullWatch: AddPullWatch;
        semanticSearchEnabled: () => boolean;
        block: {
          create: WriteApi<CreateBlockArgs>;
          update: WriteApi<UpdateBlockArgs>;
          move: WriteApi<MoveBlockArgs>;
          delete: WriteApi<DeleteBlockArgs>;
          reorderBlocks: (args: {
            location: { "parent-uid": string };
            blocks: string[];
            "user-uid"?: string;
          }) => Promise<void>;
          fromMarkdown: (args: {
            location: {
              "parent-uid": string;
              order: number | "first" | "last";
            };
            "markdown-string": string;
          }) => Promise<{ uids: string[] }>;
          addComment: (
            args: {
              "block-uid": string;
              "reply-uid"?: string;
              "open-comment"?: boolean;
            } & (
              | { "reply-string": string; "reply-markdown"?: never }
              | { "reply-string"?: never; "reply-markdown": string }
            ),
          ) => Promise<{ uids: string[]; parentUid: string }>;
        };
        fast: {
          q: (query: string, ...params: unknown[]) => unknown[][];
        };
        async: {
          q: (query: string, ...params: unknown[]) => Promise<unknown[][]>;
          pull: (
            selector: string,
            id: PullEntityId,
            options?: PullOptions,
          ) => Promise<PullBlock>;
          pull_many: (
            pattern: string,
            eids: PullEntityId[],
            options?: PullOptions,
          ) => Promise<PullBlock[]>;
          search: (args: SearchArgs) => Promise<PullBlock[]>;
          semanticSearch: SemanticSearch;
          fast: {
            q: (query: string, ...params: unknown[]) => Promise<unknown[][]>;
          };
        };
        backend: {
          q: (query: string, ...params: unknown[]) => Promise<unknown[][]>;
        };
        page: {
          create: WriteApi<CreatePageArgs>;
          update: WriteApi<UpdatePageArgs>;
          delete: WriteApi<DeletePageArgs>;
          fromMarkdown: (args: {
            page: {
              title: string;
              uid?: string;
              "children-view-type"?: "bullet" | "numbered" | "document";
            };
            "markdown-string": string;
          }) => Promise<{ uid: string }>;
          addShortcut: (uid: string, index?: number) => Promise<void>;
          removeShortcut: (uid: string) => Promise<void>;
        };
        pull: (
          selector: string,
          id: PullEntityId,
          options?: PullOptions,
        ) => PullBlock;
        pull_many: (
          pattern: string,
          eids: PullEntityId[],
          options?: PullOptions,
        ) => PullBlock[];
        q: (query: string, ...params: unknown[]) => unknown[][];
        search: (args: SearchArgs) => PullBlock[];
        roamQuery: (args: RoamQueryArgs) => Promise<RoamQueryResponse>;
        removePullWatch: (
          pullPattern?: string,
          entityId?: string,
          callback?: (
            before: PullBlock | null,
            after: PullBlock | null,
          ) => void,
        ) => Promise<null | true>;
        redo: () => Promise<void>;
        undo: () => Promise<void>;
        user: {
          upsert: (args: {
            "user-uid": string;
            "display-name"?: string;
            "photo-url"?: string;
          }) => Promise<void>;
        };
        ai: Record<string, unknown>;
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
          }) => Promise<null>;
          removeCommand: (action: { label: string }) => Promise<null>;
        };
        slashCommand: SlashCommandApi;
        blockContextMenu: ContextMenu<BlockContext, Promise<null>>;
        pageContextMenu: ContextMenu<PageContext>;
        pageRefContextMenu: ContextMenu<PageRefContext>;
        blockRefContextMenu: ContextMenu<BlockRefContext>;
        pageLinkContextMenu: ContextMenu<PageLinkContext>;
        individualMultiselect: {
          getSelectedUids: () => string[];
        };
        multiselect: {
          getSelected: () => FocusedBlock[];
        };
        msContextMenu: {
          addCommand: (action: {
            label: string;
            callback: () => void;
            "display-conditional"?: () => boolean;
          }) => null;
          removeCommand: (action: { label: string }) => null;
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
          getSidebarWindowFilters: (args: {
            window: SidebarFilterWindowInput;
          }) => {
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
            window: SidebarFilterWindowInput;
            filters: { includes?: string[]; removes?: string[] };
          }) => Promise<void>;
        };
        getFocusedBlock: () => FocusedBlock | null;
        components: {
          renderBlock: (args: {
            uid: string;
            el: HTMLElement;
            "zoom-path?"?: boolean;
            "open?"?: boolean;
            "zoom-start-after-uid"?: string;
          }) => Promise<null>;
          renderPage: (args: {
            uid: string;
            el: HTMLElement;
            "hide-mentions?"?: boolean;
          }) => Promise<null>;
          renderSearch: (args: {
            "search-query-str": string;
            el: HTMLElement;
            "closed?"?: boolean;
            "group-by-page?"?: boolean;
            "hide-paths?"?: boolean;
            "config-changed-callback"?: (config: unknown) => void;
          }) => Promise<null>;
          renderString: (args: {
            string: string;
            el: HTMLElement;
          }) => Promise<null>;
          unmountNode: (args: { el: HTMLElement }) => Promise<null>;
        };
        react: {
          Block: (props: {
            uid: string;
            open?: boolean;
            zoomPath?: boolean;
            zoomStartAfterUid?: string;
          }) => JSX.Element;
          Page: (
            props:
              | {
                  uid: string;
                  title?: never;
                  hideMentions?: boolean;
                }
              | {
                  uid?: never;
                  title: string;
                  hideMentions?: boolean;
                },
          ) => JSX.Element;
          Search: (props: {
            searchQueryStr: string;
            closed?: boolean;
            groupByPage?: boolean;
            hidePaths?: boolean;
            onConfigChange?: (config: {
              closed?: boolean;
              groupByPage?: boolean;
              hidePaths?: boolean;
            }) => void;
          }) => JSX.Element;
          BlockString: (props: { string: string }) => JSX.Element;
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
          }) => void;
          removeCallback: (props: { label: string }) => null;
          wholeGraph: {
            addCallback: (props: {
              label: string;
              callback: (arg: { "sigma-renderer": unknown }) => void;
            }) => null;
            removeCallback: (props: { label: string }) => null;
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
          getOpenView: () => Promise<OpenMainWindowView>;
          openDailyNotes: () => Promise<void>;
          registerComponent: (id: string, component: React.ElementType) => void;
          unregisterComponent: (id: string) => void;
          openComponent: (id: string, ...args: unknown[]) => void;
          closeComponent: (id: string) => void;
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
      depot: {
        getInstalledExtensions: () => Record<string, InstalledExtension>;
        reloadDeveloperExtensions: () => Promise<{
          reloaded: { id: string; name: string }[];
        }>;
      };
      file: {
        upload: (args: {
          file: File;
          toast?: { hide?: boolean };
        }) => Promise<string>;
        get: <TFormat extends "base64" | undefined = undefined>(args: {
          url: string;
          format?: TFormat;
        }) => Promise<
          TFormat extends "base64"
            ? { base64: string; filename: string; mimetype: string }
            : File
        >;
        delete: (args: { url: string }) => Promise<void>;
      };
      user: {
        uid: () => string | null;
        isAdmin: () => boolean;
      };
      ai: AiToolApi;
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
