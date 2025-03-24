import { PullBlock, RoamBasicNode } from "../types";

const sortBasicNodes = (c: PullBlock[]): RoamBasicNode[] =>
  c
    .sort((a, b) => (a[":block/order"] || 0) - (b[":block/order"] || 0))
    .map((node) => ({
      children: sortBasicNodes(node[":block/children"] || []),
      uid: node[":block/uid"] || "",
      text: node[":block/string"] || "",
    }));

const getBasicTreeByParentUid = async (
  uid: string
): Promise<RoamBasicNode[]> => {
  const result = await window.roamAlphaAPI.data.backend.q(
    `[:find (pull ?c [:block/string :block/uid :block/order {:block/children ...}]) :where [?b :block/uid "${uid}"] [?b :block/children ?c]]`
  );
  return sortBasicNodes(result.map((a) => a[0] as PullBlock));
};

export default getBasicTreeByParentUid;
