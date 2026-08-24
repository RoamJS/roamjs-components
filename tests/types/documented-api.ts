import type { OnloadArgs } from "../../src/types";
import type { FC } from "react";

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
  await window.roamAlphaAPI.data.removePullWatch();
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
  window.roamAlphaAPI.ui.callout.addType({ type: "recipe" });
  window.roamAlphaAPI.ui.callout.removeType({ type: "recipe" });

  await window.roamAlphaAPI.ui.rightSidebar.addWindow({
    window: { type: "outline", "block-uid": "abc123xyz" },
  });
  const sidebarWindows = window.roamAlphaAPI.ui.rightSidebar.getWindows();
  await window.roamAlphaAPI.depot.reloadDeveloperExtensions();
  const base64File = await window.roamAlphaAPI.file.get({
    url: "https://example.com/file",
    format: "base64",
  });
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
};
