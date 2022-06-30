import type { AddPullWatch, PullBlock } from "../types/native";

const watchOnce = (
  pullPattern: string,
  entityId: string,
  callback: (before: PullBlock | null, after: PullBlock | null) => boolean
): void => {
  const watcher: Parameters<AddPullWatch>[2] = (before, after) => {
    if (callback(before, after)) {
      window.roamAlphaAPI.data.removePullWatch(pullPattern, entityId, watcher);
    }
    return true;
  };
  window.roamAlphaAPI.data.addPullWatch(pullPattern, entityId, watcher);
};

export default watchOnce;
