import type { OnloadArgs } from "../../src/types";
import type { FC } from "react";

type Assert<T extends true> = T;
type AssertFalse<T extends false> = T;
type IsAssignable<T, U> = T extends U ? true : false;
type IsExact<T, U> = (<V>() => V extends T ? 1 : 2) extends <V>() => V extends U
  ? 1
  : 2
  ? true
  : false;

type CreateBlockArgs = Parameters<
  typeof window.roamAlphaAPI.data.block.create
>[0];
type UpdateBlockArgs = Parameters<
  typeof window.roamAlphaAPI.data.block.update
>[0];
type MoveBlockArgs = Parameters<typeof window.roamAlphaAPI.data.block.move>[0];
type DeleteBlockArgs = Parameters<
  typeof window.roamAlphaAPI.data.block.delete
>[0];
type CreatePageArgs = Parameters<
  typeof window.roamAlphaAPI.data.page.create
>[0];
type UpdatePageArgs = Parameters<
  typeof window.roamAlphaAPI.data.page.update
>[0];
type DeletePageArgs = Parameters<
  typeof window.roamAlphaAPI.data.page.delete
>[0];
type RoamQueryArgs = Parameters<typeof window.roamAlphaAPI.data.roamQuery>[0];
type SetWindowOrderArgs = Parameters<
  typeof window.roamAlphaAPI.ui.rightSidebar.setWindowOrder
>[0];
type RenderBlockArgs = Parameters<
  typeof window.roamAlphaAPI.ui.components.renderBlock
>[0];
type RemovePullWatchArgs = Parameters<
  typeof window.roamAlphaAPI.data.removePullWatch
>;
type CreateBlockRequiresFields = AssertFalse<
  IsAssignable<Record<string, never>, CreateBlockArgs>
>;
type CreateBlockRequiresString = AssertFalse<
  IsAssignable<
    {
      location: { "parent-uid": string; order: number };
      block: Record<string, never>;
    },
    CreateBlockArgs
  >
>;
type UpdateBlockRequiresUid = AssertFalse<
  IsAssignable<{ block: { string: string } }, UpdateBlockArgs>
>;
type MoveBlockRequiresLocation = AssertFalse<
  IsAssignable<{ block: { uid: string } }, MoveBlockArgs>
>;
type DeleteBlockRequiresUid = AssertFalse<
  IsAssignable<{ block: Record<string, never> }, DeleteBlockArgs>
>;
type CreatePageRequiresTitle = AssertFalse<
  IsAssignable<{ page: Record<string, never> }, CreatePageArgs>
>;
type UpdatePageRequiresUid = AssertFalse<
  IsAssignable<{ page: { title: string } }, UpdatePageArgs>
>;
type DeletePageRequiresUid = AssertFalse<
  IsAssignable<{ page: Record<string, never> }, DeletePageArgs>
>;
type RoamQueryModesAreExclusive = AssertFalse<
  IsAssignable<{ uid: string; query: string }, RoamQueryArgs>
>;
type RoamQueryGroupedSortIsConstrained = AssertFalse<
  IsAssignable<
    { query: string; groupByPage: true; sort: "created-date" },
    RoamQueryArgs
  >
>;
type RoamQueryUngroupedSortIsConstrained = AssertFalse<
  IsAssignable<
    { query: string; groupByPage: false; sort: "page-title" },
    RoamQueryArgs
  >
>;
type RoamQueryAcceptsComputedGroupingWithoutSort = Assert<
  IsAssignable<{ query: string; groupByPage: boolean }, RoamQueryArgs>
>;
type RoamQueryComputedGroupingStillRejectsSort = AssertFalse<
  IsAssignable<
    { query: string; groupByPage: boolean; sort: "page-title" },
    RoamQueryArgs
  >
>;
type SidebarOrderIsRequired = AssertFalse<
  IsAssignable<
    { window: { type: "outline"; "block-uid": string } },
    SetWindowOrderArgs
  >
>;
type RenderBlockZoomStartRequiresZoomPath = AssertFalse<
  IsAssignable<
    { uid: string; el: HTMLElement; "zoom-start-after-uid": string },
    RenderBlockArgs
  >
>;
type RenderBlockAcceptsComputedZoomPathWithoutStartUid = Assert<
  IsAssignable<
    { uid: string; el: HTMLElement; "zoom-path?": boolean },
    RenderBlockArgs
  >
>;
type RenderBlockComputedZoomPathStillRejectsStartUid = AssertFalse<
  IsAssignable<
    {
      uid: string;
      el: HTMLElement;
      "zoom-path?": boolean;
      "zoom-start-after-uid": string;
    },
    RenderBlockArgs
  >
>;
type PartialRemovePullWatchIsRejected = AssertFalse<
  IsAssignable<[pullPattern: string], RemovePullWatchArgs>
>;
type BlockPropsRemainSupported = Assert<
  IsAssignable<
    { block: { uid: string; props: Record<string, unknown> } },
    UpdateBlockArgs
  >
>;
type QueryResultIsExact = Assert<
  IsExact<
    Awaited<ReturnType<typeof window.roamAlphaAPI.data.roamQuery>>["total"],
    number
  >
>;
type CustomPullAttributesAreRepresentable = Assert<
  IsAssignable<
    { ":custom/attribute": string },
    ReturnType<typeof window.roamAlphaAPI.data.search>[number]
  >
>;

export const exerciseDocumentedApis = async ({
  extensionAPI,
}: OnloadArgs): Promise<void> => {
  const apiVersion: string = window.roamAlphaAPI.apiVersion;
  const pullResult = window.roamAlphaAPI.data.pull(
    "[*]",
    [":block/uid", "abc123xyz"],
    { timeout: 60_000 },
  );
  const searchResults = window.roamAlphaAPI.data.search({
    "search-str": "project",
    limit: 50,
  });
  const asyncSearchResults = await window.roamAlphaAPI.data.async.search({
    "search-string": "project",
  });
  const queryResults = await window.roamAlphaAPI.data.roamQuery({
    query: "{and: [[project]] [[active]]}",
    groupByPage: true,
    sort: "page-most-recent",
  });

  await window.roamAlphaAPI.data.addPullWatch(
    "[:block/string]",
    '[:block/uid "abc123xyz"]',
    () => undefined,
  );
  const removeAllPullWatchesResult: null =
    await window.roamAlphaAPI.data.removePullWatch();
  const removeMatchingPullWatchesResult: true =
    await window.roamAlphaAPI.data.removePullWatch(
      "[:block/string]",
      '[:block/uid "abc123xyz"]',
    );
  const removePullWatchCallbackResult: null =
    await window.roamAlphaAPI.data.removePullWatch(
      "[:block/string]",
      '[:block/uid "abc123xyz"]',
      () => undefined,
    );
  await window.roamAlphaAPI.data.block.fromMarkdown({
    location: { "parent-uid": "abc123xyz", order: "last" },
    "markdown-string": "- First block",
  });
  await window.roamAlphaAPI.data.block.addComment({
    "block-uid": "abc123xyz",
    "reply-string": "A comment",
  });
  await window.roamAlphaAPI.data.page.fromMarkdown({
    page: { title: "New page", "children-view-type": "document" },
    "markdown-string": "# Heading",
  });
  await window.roamAlphaAPI.data.page.addShortcut("abc123xyz", 0);
  await window.roamAlphaAPI.data.page.removeShortcut("abc123xyz");
  await window.roamAlphaAPI.data.user.upsert({
    "user-uid": "user123",
    "display-name": "User",
  });

  window.roamAlphaAPI.ui.slashCommand.addCommand({
    label: "Insert greeting",
    callback: ({ indexes }) => (indexes.length ? "Hello" : null),
  });
  await window.roamAlphaAPI.ui.blockContextMenu.addCommand({
    label: "Inspect block",
    "display-conditional": (context) => !context["read-only?"],
    callback: ({ "block-uid": blockUid }) => void blockUid,
  });
  window.roamAlphaAPI.ui.pageContextMenu.addCommand({
    label: "Inspect page",
    callback: ({ "page-uid": pageUid }) => void pageUid,
  });
  window.roamAlphaAPI.ui.pageRefContextMenu.addCommand({
    label: "Inspect page reference",
    callback: ({ type }) => void type,
  });
  window.roamAlphaAPI.ui.blockRefContextMenu.addCommand({
    label: "Inspect block reference",
    callback: ({ "ref-uid": refUid }) => void refUid,
  });
  window.roamAlphaAPI.ui.pageLinkContextMenu.addCommand({
    label: "Inspect page link",
    callback: ({ "page-title": pageTitle }) => void pageTitle,
  });
  const selectedBlocks = window.roamAlphaAPI.ui.multiselect.getSelected();
  const openView = await window.roamAlphaAPI.ui.mainWindow.getOpenView();
  const Component: FC = () => null;
  window.roamAlphaAPI.ui.mainWindow.registerComponent("custom-view", Component);
  window.roamAlphaAPI.ui.mainWindow.openComponent("custom-view", "argument");
  window.roamAlphaAPI.ui.mainWindow.closeComponent("custom-view");
  window.roamAlphaAPI.ui.mainWindow.unregisterComponent("custom-view");
  await window.roamAlphaAPI.ui.rightSidebar.addWindow({
    window: { type: "outline", "block-uid": "abc123xyz" },
  });
  const sidebarWindows = window.roamAlphaAPI.ui.rightSidebar.getWindows();
  await window.roamAlphaAPI.depot.reloadDeveloperExtensions();
  const base64File = await window.roamAlphaAPI.file.get({
    url: "https://example.com/file",
    format: "base64",
  });
  const optionalFormat = Date.now() % 2 === 0 ? ("base64" as const) : undefined;
  const optionallyBase64File = await window.roamAlphaAPI.file.get({
    url: "https://example.com/file",
    format: optionalFormat,
  });
  const optionalFileResult:
    | File
    | {
        base64: string;
        filename: string;
        mimetype: string;
      } = optionallyBase64File;
  const isAdmin = window.roamAlphaAPI.user.isAdmin();
  window.roamAlphaAPI.ai.addTool({
    name: "word-count",
    description: "Counts words in a block.",
    scope: "read",
    inputSchema: { type: "object" },
    handler: ({ uid }, context) => ({
      uid: String(uid),
      user: context.tokenUserUid || null,
    }),
  });
  window.roamAlphaAPI.ai.removeTool({ name: "word-count" });

  const canSet = extensionAPI.settings.canSet;
  await extensionAPI.settings.set("enabled", true);
  await extensionAPI.settings.panel.create({
    tabTitle: "Example",
    settings: [
      {
        id: "mode",
        name: "Mode",
        action: {
          type: "select",
          items: ["fast", "thorough"],
          onChange: (item) => void item,
        },
      },
    ],
  });
  extensionAPI.ui.slashCommand.addCommand({
    label: "Insert greeting",
    callback: () => "Hello",
  });
  extensionAPI.ai.addTool({
    name: "status",
    description: "Returns extension status.",
    handler: () => ({ ok: true }),
  });

  void apiVersion;
  void pullResult;
  void searchResults;
  void asyncSearchResults;
  void queryResults;
  void selectedBlocks;
  void openView;
  void sidebarWindows;
  void base64File;
  void isAdmin;
  void canSet;
  void optionallyBase64File;
  void optionalFileResult;
  void removeAllPullWatchesResult;
  void removeMatchingPullWatchesResult;
  void removePullWatchCallbackResult;
};

export type DocumentedApiTypeAssertions =
  | CreateBlockRequiresFields
  | CreateBlockRequiresString
  | UpdateBlockRequiresUid
  | MoveBlockRequiresLocation
  | DeleteBlockRequiresUid
  | CreatePageRequiresTitle
  | UpdatePageRequiresUid
  | DeletePageRequiresUid
  | RoamQueryModesAreExclusive
  | RoamQueryGroupedSortIsConstrained
  | RoamQueryUngroupedSortIsConstrained
  | RoamQueryAcceptsComputedGroupingWithoutSort
  | RoamQueryComputedGroupingStillRejectsSort
  | SidebarOrderIsRequired
  | RenderBlockZoomStartRequiresZoomPath
  | RenderBlockAcceptsComputedZoomPathWithoutStartUid
  | RenderBlockComputedZoomPathStillRejectsStartUid
  | PartialRemovePullWatchIsRejected
  | BlockPropsRemainSupported
  | QueryResultIsExact
  | CustomPullAttributesAreRepresentable;
