import type { PullBlock } from "../types/native";

const getNthChildUidByBlockUid = async ({
  blockUid,
  order,
}: {
  blockUid: string;
  order: number;
}): Promise<string> => {
  const result = await window.roamAlphaAPI.data.backend.q(
    `[:find (pull ?c [:block/uid]) :where [?p :block/uid "${blockUid}"] [?p :block/children ?c] [?c :block/order ${order}] ]`
  );
  return (result?.[0]?.[0] as PullBlock)?.[":block/uid"] || "";
};

export default getNthChildUidByBlockUid;
