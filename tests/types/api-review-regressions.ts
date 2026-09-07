import type { AiToolContext, OnloadArgs } from "../../src/types";

const assertType = <T extends true>(assertion: T): void => {
  void assertion;
};
type IsExact<T, U> = (<V>() => V extends T ? 1 : 2) extends <V>() => V extends U
  ? 1
  : 2
  ? true
  : false;

type ExpectedBase64File = {
  base64: string;
  filename: string;
  mimetype: string;
};
type ExpectedDeleteResult =
  | { deleted: true }
  | { deleted: false; reason: string };

// Compile-only consumer examples; never execute these graph writes.
export const exerciseReviewRegressions = async ({
  context,
  extensionAPI,
  options,
}: {
  context: AiToolContext;
  extensionAPI: OnloadArgs["extensionAPI"];
  options: { url: string; format?: "base64" };
}): Promise<void> => {
  const api = window.roamAlphaAPI;
  const url = "https://example.com/file";
  const defaultFile = await api.file.get({ url });
  const base64File = await api.file.get({ url, format: "base64" });
  const explicitUndefinedFile = await api.file.get({ url, format: undefined });
  const format = Date.now() % 2 === 0 ? ("base64" as const) : undefined;
  const optionalFormatFile = await api.file.get({ url, format });
  const optionalOptionsFile = await api.file.get(options);

  // @ts-expect-error An optional format may produce a File, which has no base64 field.
  optionalOptionsFile.base64.toUpperCase();
  // @ts-expect-error A computed format must be narrowed before accessing base64.
  optionalFormatFile.base64.toUpperCase();
  // @ts-expect-error Only base64 is a supported format override.
  api.file.get({ url, format: "text" });

  await api.data.page.create({
    page: { title: "Example", props: { custom: true } },
  });
  await api.data.page.update({
    page: { uid: "abc123xyz", props: { custom: true } },
  });
  await api.createPage({ page: { title: "Legacy", props: { custom: true } } });
  await api.updatePage({ page: { uid: "abc123xyz", props: { custom: true } } });

  const deleteBlock = await api.data.block.delete({
    block: { uid: "abc123xyz" },
  });
  const deletePage = await api.data.page.delete({ page: { uid: "abc123xyz" } });
  const legacyDeleteBlock = await api.deleteBlock({
    block: { uid: "abc123xyz" },
  });
  const legacyDeletePage = await api.deletePage({ page: { uid: "abc123xyz" } });
  if (!deleteBlock.deleted) {
    deleteBlock.reason.toUpperCase();
  } else {
    // @ts-expect-error A successful deletion does not have a failure reason.
    void deleteBlock.reason;
  }

  const writePromise = context.asTokenUser(() =>
    api.data.block.update({ block: { uid: "abc123xyz", string: "Updated" } }),
  );
  const scalar = context.asTokenUser(() => 42);
  await writePromise;
  extensionAPI.ai.addTool({
    name: "update-block",
    description: "Update a block with AI attribution.",
    handler: async (_args, toolContext) => {
      await toolContext.asTokenUser(() =>
        api.data.block.update({
          block: { uid: "abc123xyz", string: "Updated" },
        }),
      );
      return { updated: true };
    },
  });

  const addCalloutType = api.ui.callout.addType({ type: "recipe" });
  const removeCalloutType = api.ui.callout.removeType({ type: "recipe" });
  // @ts-expect-error Callout registration requires a type name.
  api.ui.callout.addType({});
  // @ts-expect-error Callout removal requires a string type name.
  api.ui.callout.removeType({ type: 42 });

  assertType<IsExact<typeof defaultFile, File>>(true);
  assertType<IsExact<typeof base64File, ExpectedBase64File>>(true);
  assertType<IsExact<typeof explicitUndefinedFile, File>>(true);
  assertType<IsExact<typeof optionalFormatFile, File | ExpectedBase64File>>(
    true,
  );
  assertType<IsExact<typeof optionalOptionsFile, File | ExpectedBase64File>>(
    true,
  );
  assertType<IsExact<typeof deleteBlock, ExpectedDeleteResult>>(true);
  assertType<IsExact<typeof deletePage, ExpectedDeleteResult>>(true);
  assertType<IsExact<typeof legacyDeleteBlock, ExpectedDeleteResult>>(true);
  assertType<IsExact<typeof legacyDeletePage, ExpectedDeleteResult>>(true);
  assertType<IsExact<typeof writePromise, Promise<void>>>(true);
  assertType<IsExact<typeof scalar, number>>(true);
  assertType<IsExact<typeof addCalloutType, null>>(true);
  assertType<IsExact<typeof removeCalloutType, null>>(true);
};
