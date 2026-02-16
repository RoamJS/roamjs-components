import type { BlockViewType, PullBlock, TreeNode, ViewType } from "../types";

const formatRoamNode = (n: PullBlock | null): TreeNode => {
  if (!n)
    return {
      text: "",
      open: true,
      order: 0,
      uid: "",
      children: [],
      parents: [],
      heading: 0,
      viewType: "bullet",
      blockViewType: "outline",
      editTime: new Date(0),
      props: { imageResize: {}, iframe: {} },
      textAlign: "left",
    };
  const viewType =
    ((n[":block/parents"] || [])
      .find((a) => typeof a[":children/view-type"] === "string")
      ?.[":children/view-type"]?.replace?.(/^:/, "") as ViewType) || "bullet";
  const blockViewType =
    (n[":block/view-type"]?.replace?.(/^:/, "") as BlockViewType) || "outline";
  return {
    text: n[":block/string"] || n[":node/title"] || "",
    open: typeof n[":block/open"] === "undefined" ? true : n[":block/open"],
    order: n[":block/order"] || 0,
    uid: n[":block/uid"] || "",
    heading: n[":block/heading"] || 0,
    viewType,
    blockViewType,
    editTime: new Date(n[":edit/time"] || 0),
    props: { imageResize: {}, iframe: {} },
    textAlign: n[":block/text-align"] || "left",
    children: (n[":block/children"] || [])
      .sort((a, b) => (a[":block/order"] || 0) - (b[":block/order"] || 0))
      .map(formatRoamNode),
    parents: (n[":block/parents"] || []).map((n) => n?.[":db/id"] || 0),
  };
};

const getFullTreeByParentUid = (uid: string): TreeNode =>
  formatRoamNode(
    window.roamAlphaAPI.pull(
      `[
      :block/string 
      :node/title 
      :block/uid 
      :block/order 
      :block/heading 
      :block/open 
      :block/view-type
      :children/view-type
      :block/text-align
      :edit/time 
      :block/props
      {:block/parents [:children/view-type]}
      {:block/children ...}
    ]`,
      [`:block/uid`, uid]
    )
  );

export default getFullTreeByParentUid;
