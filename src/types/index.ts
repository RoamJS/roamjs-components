import {
  AddPullWatch,
  PullBlock,
  SidebarAction,
  SidebarWindow,
  SidebarWindowInput,
  WriteAction,
} from "./native";
import {
  RegisterSelection,
  ParseQuery,
  FireQuery,
  ConditionToDatalog,
  RegisterDatalogTranslator,
  ResultsViewComponent,
  QueryEditorComponent,
  ExportDialogComponent,
  QueryPageComponent,
} from "./query-builder";
import { SamePageApi } from "./samepage";
import { RegisterCommand, UnregisterCommand } from "./smartblocks";
import type marked from "marked";
import type Markdown from "marked-react";
import type JSZip from "jszip";
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
    };
    // END TODO remove

    roamAlphaAPI: {
      q: (query: string, ...params: unknown[]) => unknown[][];
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
        pull: (
          selector: string,
          id: number | string | [string, string]
        ) => PullBlock;
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
        multiplayer?: SamePageApi;
        samepage?: SamePageApi;
        queryBuilder?: {
          ExportDialog: ExportDialogComponent;
          QueryEditor: QueryEditorComponent;
          QueryPage: QueryPageComponent;
          ResultsView: ResultsViewComponent;
          fireQuery: FireQuery;
          parseQuery: ParseQuery;
          conditionToDatalog: ConditionToDatalog;
          getConditionLabels: () => string[];
          registerDatalogTranslator: RegisterDatalogTranslator;
          unregisterDatalogTranslator: (args: { key: string }) => void;
          registerSelection: RegisterSelection;
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
