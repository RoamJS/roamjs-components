import { InputTextNode, RoamBasicNode } from "../types";

export const stripUid = (n: RoamBasicNode[]): InputTextNode[] => {
  return n.map(({ uid: _uid, children, ...c }) => ({
    ...c,
    children: stripUid(children),
  }));
};
