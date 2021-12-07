import getUids from "./getUids";

const getActiveUids = (): ReturnType<typeof getUids> =>
  getUids(document.activeElement as HTMLTextAreaElement)

export default getActiveUids;
