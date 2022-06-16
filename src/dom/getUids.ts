import getUidsFromId from "./getUidsFromId";

const getUids = (
  block: HTMLDivElement | HTMLTextAreaElement
): ReturnType<typeof getUidsFromId> => {
  return block ? getUidsFromId(block.id) : { blockUid: "", windowId: "" };
};

export default getUids;
