import type {
  RoamBasicNode,
  RoamUnorderedBasicNode,
  TextAlignment,
  TreeNode,
  ViewType,
} from "../types";

export { default as normalizePageTitle } from "./normalizePageTitle";
export { default as getCreateTimeByBlockUid } from "./getCreateTimeByBlockUid";
export { default as getDisplayNameByEmail } from "./getDisplayNameByEmail";
export { default as getDisplayNameByUid } from "./getDisplayNameByUid";
export { default as getEditTimeByBlockUid } from "./getEditTimeByBlockUid";
export { default as getEditedUserEmailByBlockUid } from "./getEditedUserEmailByBlockUid";
export { default as getOrderByBlockUid } from "./getOrderByBlockUid";
export { default as getPageTitleByBlockUid } from "./getPageTitleByBlockUid";
export { default as getPageTitleReferencesByPageTitle } from "./getPageTitleReferencesByPageTitle";
export { default as getParentTextByBlockUid } from "./getParentTextByBlockUid";
export { default as getParentTextByBlockUidAndTag } from "./getParentTextByBlockUidAndTag";
export { default as getParentUidByBlockUid } from "./getParentUidByBlockUid";
export { default as getSettingsByEmail } from "./getSettingsByEmail";
export { default as getTextByBlockUid } from "./getTextByBlockUid";

export const getAllPageNames = (): string[] =>
  window.roamAlphaAPI
    .q("[:find ?s :where [?e :node/title ?s]]")
    .map((b) => b[0] as string);

export const getAllBlockUids = (): string[] =>
  window.roamAlphaAPI
    .q(`[:find ?u :where [?e :block/uid ?u] [?e :block/string]]`)
    .map((f) => f[0] as string);

export const getAllBlockUidsAndTexts = (): { uid: string; text: string }[] =>
  window.roamAlphaAPI
    .q(`[:find ?u ?s :where [?e :block/uid ?u] [?e :block/string ?s]]`)
    .map((f) => ({ uid: f[0] as string, text: f[1] as string }));

export const getPageViewType = (title: string): ViewType =>
  (window.roamAlphaAPI.q(
    `[:find ?v :where [?e :children/view-type ?v] [?e :node/title "${normalizePageTitle(
      title
    )}"]]`
  )?.[0]?.[0] as ViewType) || "bullet";

export const getPageUidByPageTitle = (title: string): string =>
  (
    window.roamAlphaAPI.q(
      `[:find (pull ?e [:block/uid]) :where [?e :node/title "${normalizePageTitle(
        title
      )}"]]`
    )?.[0]?.[0] as { uid?: string }
  )?.uid || "";

export const getBlockUidAndTextIncludingText = (
  t: string
): { uid: string; text: string }[] =>
  window.roamAlphaAPI
    .q(
      `[:find ?u ?contents :where [?block :block/uid ?u] [?block :block/string ?contents][(clojure.string/includes? ?contents  "${t}")]]`
    )
    .map(([uid, text]: string[]) => ({ uid, text }));

export const getBlockUidsAndTextsReferencingPage = (
  title: string
): { uid: string; text: string }[] =>
  window.roamAlphaAPI
    .q(
      `[:find ?u ?s :where [?r :block/uid ?u] [?r :block/string ?s] [?r :block/refs ?p] [?p :node/title "${normalizePageTitle(
        title
      )}"]]`
    )
    .map(([uid, text]: string[]) => ({ uid, text }));

export const getBlockUidByTextOnPage = ({
  text,
  title,
}: {
  text: string;
  title: string;
}): string =>
  (window.roamAlphaAPI.q(
    `[:find ?u :where [?b :block/page ?p] [?b :block/uid ?u] [?b :block/string "${text}"] [?p :node/title "${title}"]]`
  )?.[0]?.[0] as string) || "";

export const getBlockUidsReferencingBlock = (uid: string): string[] =>
  window.roamAlphaAPI
    .q(
      `[:find ?u :where [?r :block/uid ?u] [?r :block/refs ?b] [?b :block/uid "${uid}"]]`
    )
    .map((s) => s[0]);

export const getBlockUidsReferencingPage = (title: string): string[] =>
  window.roamAlphaAPI
    .q(
      `[:find ?u :where [?r :block/uid ?u] [?r :block/refs ?p] [?p :node/title "${normalizePageTitle(
        title
      )}"]]`
    )
    .map((s) => s[0]);

export const getChildrenLengthByPageUid = (uid: string): number =>
  window.roamAlphaAPI.q(
    `[:find ?c :where [?e :block/children ?c] [?e :block/uid "${uid}"]]`
  ).length;

export const getPageTitlesStartingWithPrefix = (prefix: string): string[] =>
  window.roamAlphaAPI
    .q(
      `[:find ?title :where [?b :node/title ?title][(clojure.string/starts-with? ?title  "${prefix}")]]`
    )
    .map((r) => r[0] as string);

export const getPageTitlesReferencingBlockUid = (uid: string): string[] =>
  window.roamAlphaAPI
    .q(
      `[:find ?t :where [?r :block/uid "${uid}"] [?b :block/refs ?r] [?b :block/page ?p] [?p :node/title ?t]]`
    )
    .map((s) => s[0]);

export const getPageTitlesAndBlockUidsReferencingPage = (
  pageName: string
): { title: string; uid: string }[] =>
  window.roamAlphaAPI
    .q(
      `[:find (pull ?pr [:node/title]) (pull ?r [:block/uid]) :where [?p :node/title "${normalizePageTitle(
        pageName
      )}"] [?r :block/refs ?p] [?r :block/page ?pr]]`
    )
    .map(([{ title }, { uid }]: Record<string, string>[]) => ({ title, uid }));

export const getPageTitlesAndUidsDirectlyReferencingPage = (
  pageName: string
): { title: string; uid: string }[] =>
  window.roamAlphaAPI
    .q(
      `[:find ?t ?u :where [?r :block/uid ?u] [?r :node/title ?t] [?r :block/refs ?p] [?p :node/title "${normalizePageTitle(
        pageName
      )}"]]`
    )
    .map(([title, uid]: string[]) => ({ title, uid }));

export const getBlockUidsByPageTitle = (title: string): string[] =>
  window.roamAlphaAPI
    .q(
      `[:find ?u :where  [?b :block/uid ?u] [?b :block/page ?e] [?e :node/title "${normalizePageTitle(
        title
      )}"]]`
    )
    .map((b) => b[0] as string);

export const getNthChildUidByBlockUid = ({
  blockUid,
  order,
}: {
  blockUid: string;
  order: number;
}): string =>
  window.roamAlphaAPI.q(
    `[:find ?u :where [?c :block/uid ?u] [?c :block/order ${order}] [?p :block/children ?c] [?p :block/uid "${blockUid}"]]`
  )?.[0]?.[0] as string;

export const getFirstChildUidByBlockUid = (blockUid: string): string =>
  getNthChildUidByBlockUid({ blockUid, order: 0 });

export const getFirstChildTextByBlockUid = (blockUid: string): string =>
  window.roamAlphaAPI.q(
    `[:find ?s :where [?c :block/string ?s] [?c :block/order 0] [?p :block/children ?c] [?p :block/uid "${blockUid}"]]`
  )?.[0]?.[0] as string;

export const getShallowTreeByParentUid = (
  parentUid: string
): { uid: string; text: string }[] =>
  window.roamAlphaAPI
    .q(
      `[:find (pull ?c [:block/uid :block/string :block/order]) :where [?b :block/uid "${parentUid}"] [?b :block/children ?c]]`
    )
    .sort((a, b) => a[0].order - b[0].order)
    .map(([a]: { uid: string; string: string }[]) => ({
      uid: a.uid,
      text: a.string,
    }));

export const getLinkedPageTitlesUnderUid = (uid: string): string[] =>
  window.roamAlphaAPI
    .q(
      `[:find ?t :where [?r :node/title ?t] [?c :block/refs ?r] [?c :block/parents ?b] [?b :block/uid "${uid}"]]`
    )
    .map((r) => r[0] as string);

export const getBlockUidsWithParentUid = (uid: string): string[] =>
  window.roamAlphaAPI
    .q(
      `[:find ?u :where [?c :block/uid ?u] [?c :block/parents ?b] [?b :block/uid "${uid}"]]`
    )
    .map((r) => r[0] as string);

export const getParentUidsOfBlockUid = (uid: string): string[] =>
  window.roamAlphaAPI
    .q(
      `[:find ?u :where [?p :block/uid ?u] [?b :block/parents ?p] [?b :block/uid "${uid}"]]`
    )
    .map((r) => r[0] as string);

const sortBasicNodes = (c: RoamUnorderedBasicNode[]): RoamBasicNode[] =>
  c
    .sort(({ order: a }, { order: b }) => a - b)
    .map(({ order: _, children = [], ...node }) => ({
      children: sortBasicNodes(children),
      ...node,
    }));

export const getBasicTreeByParentUid = (uid: string): RoamBasicNode[] =>
  sortBasicNodes(
    window.roamAlphaAPI
      .q(
        `[:find (pull ?c [[:block/string :as "text"] :block/uid :block/order {:block/children ...}]) :where [?b :block/uid "${uid}"] [?b :block/children ?c]]`
      )
      .map((a) => a[0] as RoamUnorderedBasicNode)
  );

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

export const getFullTreeByParentUid = (uid: string): TreeNode =>
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

export const isTagOnPage = ({
  tag,
  title,
}: {
  tag: string;
  title: string;
}): boolean =>
  !!window.roamAlphaAPI.q(
    `[:find ?r :where [?r :node/title "${normalizePageTitle(
      tag
    )}"] [?b :block/refs ?r] [?b :block/page ?p] [?p :node/title "${normalizePageTitle(
      title
    )}"]]`
  )?.[0]?.[0];

const getCurrentUser = (): string[] => {
  const globalAppState = JSON.parse(
    localStorage.getItem("globalAppState") || '["","",[]]'
  ) as (string | string[])[];
  const userIndex = globalAppState.findIndex((s) => s === "~:user");
  if (userIndex > 0) {
    return globalAppState[userIndex + 1] as string[];
  }
  return [];
};

export const getCurrentUserEmail = (): string => {
  const userArray = getCurrentUser();
  const emailIndex = userArray.findIndex((s) => s === "~:email");
  if (emailIndex > 0) {
    return userArray[emailIndex + 1];
  }
  return "";
};

export const getCurrentUserUid = (): string => {
  const userArray = getCurrentUser();
  const uidIndex = userArray.findIndex((s) => s === "~:uid");
  if (uidIndex > 0) {
    return userArray[uidIndex + 1];
  }
  return "";
};

export const getCurrentUserDisplayName = (): string => {
  const userArray = getCurrentUser();
  const uidIndex = userArray.findIndex((s) => s === "~:display-name");
  if (uidIndex > 0) {
    return userArray[uidIndex + 1] || "";
  }
  return "";
};
