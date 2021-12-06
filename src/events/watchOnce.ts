import type { PullBlock } from "../types";

const watchOnce = (
  pullPattern: string,
  entityId: string,
  callback: (before: PullBlock, after: PullBlock) => boolean
): void => {
  const watcher = (before: PullBlock, after: PullBlock) => {
    if (callback(before, after)) {
      window.roamAlphaAPI.data.removePullWatch(pullPattern, entityId, watcher);
    }
  };
  window.roamAlphaAPI.data.addPullWatch(pullPattern, entityId, watcher);
};

export default watchOnce;
