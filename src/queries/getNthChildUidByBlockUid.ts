import type { PullBlock } from "../types/native";

const getNthChildUidByBlockUid = ({
  blockUid,
  order,
}: {
  blockUid: string;
  order: number;
}): string =>
  window.roamAlphaAPI.data.fast.q<[PullBlock]>(
    `[:find (pull ?c [:block/uid]) :where [?p :block/uid "${blockUid}"] [?p :block/children ?c] [?c :block/order ${order}] ]`
  )?.[0]?.[0]?.[":block/uid"] || "";

export default getNthChildUidByBlockUid;
