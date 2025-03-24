import type { PullBlock, TreeNode, ViewType } from "../types";

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
      editTime: new Date(0),
      props: { imageResize: {}, iframe: {} },
      textAlign: "left",
    };
  const viewType =
    ((n[":block/parents"] || [])
      .find((a) => typeof a[":children/view-type"] === "string")
      ?.[":children/view-type"]?.replace?.(/^:/, "") as ViewType) || "bullet";
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
      .sort((a, b) => (a[":block/order"] || 0) - (b[":block/order"] || 0))
      .map(formatRoamNode),
    parents: (n[":block/parents"] || []).map((n) => n?.[":db/id"] || 0),
  };
};

const getFullTreeByParentUid = async (uid: string): Promise<TreeNode> => {
  const result = await window.roamAlphaAPI.data.pull(
    `[
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
      {:block/parents [:children/view-type]}
      {:block/children ...}
    ]`,
    [`:block/uid`, uid]
  );
  return formatRoamNode(result);
};

export default getFullTreeByParentUid;
