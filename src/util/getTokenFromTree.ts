import type { RoamBasicNode } from "../types";

const getTokenFromTree = (tree: RoamBasicNode[]): string =>
  tree.find((t) => /token/i.test(t.text))?.children?.[0]?.text || "";

export default getTokenFromTree;
