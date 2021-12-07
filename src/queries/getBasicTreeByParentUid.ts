import { RoamBasicNode, RoamUnorderedBasicNode } from "../types";

const sortBasicNodes = (c: RoamUnorderedBasicNode[]): RoamBasicNode[] =>
  c
    .sort(({ order: a }, { order: b }) => a - b)
    .map(({ order: _, children = [], ...node }) => ({
      children: sortBasicNodes(children),
      ...node,
    }));

const getBasicTreeByParentUid = (uid: string): RoamBasicNode[] =>
  sortBasicNodes(
    window.roamAlphaAPI
      .q(
        `[:find (pull ?c [[:block/string :as "text"] :block/uid :block/order {:block/children ...}]) :where [?b :block/uid "${uid}"] [?b :block/children ?c]]`
      )
      .map((a) => a[0] as RoamUnorderedBasicNode)
  );

export default getBasicTreeByParentUid;
