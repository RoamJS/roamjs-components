import type { PullBlock, TreeNode, ViewType } from "../types";

const formatRoamNode = (n: PullBlock, v: ViewType): TreeNode => {
  const viewType = (
    typeof n[":children/view-type"] === "string" ? n[":children/view-type"] : v
  ).replace(/^:/, "") as ViewType;
  return {
    text: n[":block/string"] || n[":node/title"] || "",
    open: typeof n[":block/open"] === "undefined" ? true : n[":block/open"],
    order: n[":block/order"] || 0,
    uid: n[":block/uid"] || "",
    heading: n[":block/heading"] || 0,
    viewType,
    editTime: new Date(n[":edit/time"] || 0),
    props: { imageResize: {}, iframe: {} },
    textAlign: n[":block/text-align"] || "left",
    children: (n[":block/children"] || [])
      .sort(
        (a: PullBlock, b: PullBlock) =>
          (a[":block/order"] || 0) - (b[":block/order"] || 0)
      )
      .map((r) => formatRoamNode(r, viewType)),
    parents: (n[":block/parents"] || []).map((n) => n[":db/id"]),
  };
};

const getFullTreeByParentUid = (uid: string): TreeNode =>
  formatRoamNode(
    (window.roamAlphaAPI.data.fast.q(
      `[:find (pull ?b [
      :block/string 
      :node/title 
      :block/uid 
      :block/order 
      :block/heading 
      :block/open 
      :children/view-type
      :block/text-align
      :edit/time 
      :block/props
      :block/parents
      {:block/children ...}
    ]) :where [?b :block/uid "${uid}"]]`
    )?.[0]?.[0] || {}) as PullBlock,
    ((
      window.roamAlphaAPI.data.fast.q(
        `[:find
      (pull ?p [:children/view-type]) :where
      [?c :block/uid "${uid}"] [?c :block/parents ?p]]`
      ) as [PullBlock][]
    )
      .reverse()
      .map((a) => a[0])
      .map((a) => a && a[":children/view-type"])
      .find((a) => !!a)
      ?.replace?.(/^:/, "") as ViewType) || "bullet"
  );

export default getFullTreeByParentUid;
