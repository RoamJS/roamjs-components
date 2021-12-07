import type { TextAlignment, TreeNode, ViewType } from "../types";

type RoamRawBlock = {
  text: string;
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
  text: n.text || "",
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
    window.roamAlphaAPI.q(
      `[:find (pull ?b [
      [:block/string :as "text"] 
      [:node/title :as "text"] 
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
    )?.[0]?.[0] || ({} as RoamRawBlock),
    window.roamAlphaAPI
      .q(
        `[:find
      (pull ?p [:children/view-type]) :where
      [?c :block/uid "${uid}"] [?c :block/parents ?p]]`
      )
      .reverse()
      .map((a) => a[0])
      .map((a) => a && a["view-type"])
      .find((a) => !!a) || "bullet"
  );

export default getFullTreeByParentUid;
