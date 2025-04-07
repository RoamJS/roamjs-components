import getBlockUidsByPageTitle from "../queries/getBlockUidsByPageTitle";
import createObserver from "./createObserver";
import getMutatedNodes from "./getMutatedNodes";
import getUids from "./getUids";

const createPageObserver = (
  name: string,
  callback: (blockUid: string, added: boolean) => void
): MutationObserver =>
  createObserver((ms) => {
    const addedNodes = getMutatedNodes({
      ms,
      nodeList: "addedNodes",
      tag: "DIV",
      className: "roam-block",
    }).map((blockNode) => ({
      blockUid: getUids(blockNode as HTMLDivElement).blockUid,
      added: true,
    }));
    const removedNodes = getMutatedNodes({
      ms,
      nodeList: "removedNodes",
      tag: "DIV",
      className: "roam-block",
    }).map((blockNode) => ({
      blockUid: getUids(blockNode as HTMLDivElement).blockUid,
      added: false,
    }));
    if (addedNodes.length || removedNodes.length) {
      getBlockUidsByPageTitle(name).then((blockUids) => {
        const blockUidSet = new Set(blockUids);
        [...removedNodes, ...addedNodes]
          .filter(({ blockUid }) => blockUidSet.has(blockUid))
          .forEach(({ blockUid, added }) => callback(blockUid, added));
      });
    }
  });

export default createPageObserver;
