import type { PullBlock, TextAlignment, TreeNode, ViewType } from "../types";

type RoamRawBlock = {
  string?: string;
  title?: string;
  uid: string;
  order: number;
  heading?: number;
  open: boolean;
  viewType?: ViewType;
  textAlign?: TextAlignment;
  editTime: number;
  props?: unknown;
  children?: RoamRawBlock[];
};

const formatRoamNode = (n: Partial<RoamRawBlock>, v: ViewType): TreeNode => ({
  text: n.string || n.title || "",
  open: typeof n.open === "undefined" ? true : n.open,
  order: n.order || 0,
  uid: n.uid || "",
  heading: n.heading || 0,
  viewType: n.viewType || v,
  editTime: new Date(n.editTime || 0),
  props: { imageResize: {}, iframe: {} },
  textAlign: n.textAlign || "left",
  children: (n.children || [])
    .sort(({ order: a }, { order: b }) => a - b)
    .map((r) => formatRoamNode(r, n.viewType || v)),
});

const getFullTreeByParentUid = (uid: string): TreeNode =>
  formatRoamNode(
    (window.roamAlphaAPI.q(
      `[:find (pull ?b [
      :block/string 
      :node/title 
      :block/uid 
      :block/order 
      :block/heading 
      :block/open 
      [:children/view-type :as "viewType"] 
      [:block/text-align :as "textAlign"] 
      [:edit/time :as "editTime"] 
      :block/props 
      {:block/children ...}
    ]) :where [?b :block/uid "${uid}"]]`
    )?.[0]?.[0] || {}) as RoamRawBlock,
    (
      window.roamAlphaAPI.data.fast.q(
        `[:find
      (pull ?p [:children/view-type]) :where
      [?c :block/uid "${uid}"] [?c :block/parents ?p]]`
      ) as [PullBlock][]
    )
      .reverse()
      .map((a) => a[0])
      .map((a) => a && a[":children/view-type"])
      .find((a) => !!a)?.slice(1) as ViewType || "bullet"
  );

export default getFullTreeByParentUid;
