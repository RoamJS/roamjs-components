const getUidsFromId = (id?: string): { blockUid: string; windowId: string } => {
  if (!id) return { blockUid: "", windowId: "" };
  const blockUid = id.substring(id.length - 9, id.length);
  const restOfHTMLId = id.substring(0, id.length - 10);
  const windowId =
    restOfHTMLId.match(/^block-input-([a-zA-Z0-9_-]+)$/)?.[1] || "";
  return {
    blockUid,
    windowId,
  };
};

export default getUidsFromId;
