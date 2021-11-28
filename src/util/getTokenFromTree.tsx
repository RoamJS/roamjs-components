import type { RoamBasicNode } from "roam-client";

export const getTokenFromTree = (tree: RoamBasicNode[]): string =>
  tree.find((t) => /token/i.test(t.text))?.children?.[0]?.text || "";
