import { PullBlock } from "../types";

const getShallowTreeByParentUid = (
  parentUid: string
): { uid: string; text: string }[] =>
  window.roamAlphaAPI.data.fast
    .q<[PullBlock]>(
      `[:find (pull ?c [:block/uid :block/string :block/order]) :where [?b :block/uid "${parentUid}"] [?b :block/children ?c]]`
    )
    .sort((a, b) => (a[0][":block/order"] || 0) - (b[0][":block/order"] || 0))
    .map(([a]) => ({
      uid: a[":block/uid"] || "",
      text: a[":block/string"] || "",
    }));

export default getShallowTreeByParentUid;
