import { PullBlock } from "../types";

const getShallowTreeByParentUid = async (
  parentUid: string
): Promise<{ uid: string; text: string }[]> => {
  const result = (await window.roamAlphaAPI.data.backend.q(
    `[:find (pull ?c [:block/uid :block/string :block/order]) :where [?b :block/uid "${parentUid}"] [?b :block/children ?c]]`
  )) as [PullBlock][];
  return result
    .sort((a, b) => (a[0][":block/order"] || 0) - (b[0][":block/order"] || 0))
    .map(([a]) => ({
      uid: a[":block/uid"] || "",
      text: a[":block/string"] || "",
    }));
};

export default getShallowTreeByParentUid;
