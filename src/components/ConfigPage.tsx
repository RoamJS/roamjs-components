import { Card, Tab, Tabs } from "@blueprintjs/core";
import React, { useCallback, useMemo, useRef, useState } from "react";
import ReactDOM from "react-dom";
import createHTMLObserver from "../dom/createHTMLObserver";
import createBlock from "../writes/createBlock";
import createPage from "../writes/createPage";
import getBasicTreeByParentUid from "../queries/getBasicTreeByParentUid";
import getPageUidByPageTitle from "../queries/getPageUidByPageTitle";
import getShallowTreeByParentUid from "../queries/getShallowTreeByParentUid";
import localStorageGet from "../util/localStorageGet";
import idToTitle from "../util/idToTitle";
import type { Field, UnionField } from "./ConfigPanels/types";
import { Brand } from "./ConfigPanels/getBrandColors";
import { InputTextNode } from "../types";

export type ConfigTab = {
  id: string;
  toggleable?: boolean | "premium";
  onEnable?: () => void;
  onDisable?: () => void;
  development?: boolean;
  fields: Field<UnionField>[];
};

type Config =
  | {
      tabs: ConfigTab[];
      versioning?: boolean;
      brand?: Brand;
    }
  | Field<UnionField>[];

const FieldTabs = ({
  id,
  fields,
  uid,
  pageUid,
  order,
  toggleable,
}: {
  uid: string;
  pageUid: string;
  order: number;
  extensionId: string;
} & ConfigTab) => {
  const parentUid = useMemo(() => {
    if (/home/i.test(id)) {
      return pageUid;
    }
    if (uid) {
      return uid;
    }
    if (toggleable) {
      return "";
    }
    const newUid = window.roamAlphaAPI.util.generateUID();
    createBlock({
      parentUid: pageUid,
      order,
      node: { text: id, uid: newUid },
    });
    return newUid;
  }, [pageUid, uid, id, toggleable]);
  const childUids = Object.fromEntries(
    getShallowTreeByParentUid(parentUid).map(({ text, uid }) => [
      text.toLowerCase().trim(),
      uid,
    ])
  );
  const [selectedTabId, setSelectedTabId] = useState(
    fields.length && typeof toggleable !== "string"
      ? fields[0].title
      : "enabled"
  );
  const onTabsChange = useCallback(
    (tabId: string) => setSelectedTabId(tabId),
    [setSelectedTabId]
  );
  return (
    <Tabs
      vertical
      id={`${id}-field-tabs`}
      onChange={onTabsChange}
      selectedTabId={selectedTabId}
      renderActiveTabPanelOnly
    >
      {fields.map((field, i) => {
        const { Panel, title, defaultValue } = field;
        return (
          <Tab
            id={title}
            key={title}
            title={idToTitle(title)}
            panel={
              <Panel
                {...field}
                defaultValue={defaultValue}
                order={i}
                parentUid={parentUid}
                uid={childUids[title.toLowerCase()]}
              />
            }
          />
        );
      })}
    </Tabs>
  );
};

const ConfigPage = ({
  id,
  config,
  pageUid,
}: {
  id: string;
  config: Config;
  pageUid: string;
}): React.ReactElement => {
  const isLegacy = "tabs" in config;
  const userTabs = isLegacy
    ? config.tabs.filter((t) => t.fields.length || t.toggleable)
    : [{ fields: config, id: "home" }];
  const [selectedTabId, setSelectedTabId] = useState(userTabs[0]?.id);
  const onTabsChange = useCallback(
    (tabId: string) => setSelectedTabId(tabId),
    [setSelectedTabId]
  );
  const tree = getBasicTreeByParentUid(pageUid);

  // first character trimmed intentionally for the `v` below
  const titleRef = useRef<HTMLDivElement>(null);
  const experimentalMode = useMemo(() => localStorageGet("experimental"), []);
  return (
    <Card style={{ color: "#202B33" }} className={"roamjs-config-panel"}>
      <div
        style={{ display: "flex", justifyContent: "space-between" }}
        ref={titleRef}
        tabIndex={-1}
      >
        <h4 style={{ padding: 4 }}>{idToTitle(id)} Configuration</h4>
      </div>
      <style>{`.roamjs-config-tabs {\npadding: 4px;\n}`}</style>
      {isLegacy ? (
        <Tabs
          id={`${id}-config-tabs`}
          onChange={onTabsChange}
          selectedTabId={selectedTabId}
          renderActiveTabPanelOnly
          className={"roamjs-config-tabs"}
        >
          {userTabs.map(
            (
              {
                id: tabId,
                fields,
                toggleable,
                development = false,
                onEnable,
                onDisable,
              },
              i
            ) => (
              <Tab
                id={tabId}
                key={tabId}
                title={idToTitle(tabId)}
                disabled={development && !experimentalMode}
                panel={
                  <FieldTabs
                    id={tabId}
                    extensionId={id}
                    fields={fields}
                    uid={
                      tree.find((t) => new RegExp(tabId, "i").test(t.text))
                        ?.uid || ""
                    }
                    pageUid={pageUid}
                    order={i}
                    toggleable={toggleable}
                    onEnable={onEnable}
                    onDisable={onDisable}
                  />
                }
              />
            )
          )}
        </Tabs>
      ) : (
        <FieldTabs
          id={"home"}
          extensionId={id}
          fields={config}
          uid={pageUid}
          pageUid={pageUid}
          order={0}
          toggleable={false}
        />
      )}
    </Card>
  );
};

// TODO: better nested type discrimination here
const fieldsToChildren = (fields: Field<UnionField>[]) =>
  fields
    .filter((f) => !!f.defaultValue)
    .map((f) => ({
      text: f.title,
      children:
        f.Panel.type === "flag"
          ? []
          : f.Panel.type === "custom"
          ? (f.defaultValue as InputTextNode[]) || []
          : f.Panel.type === "pages" || f.Panel.type === "multitext"
          ? (f.defaultValue as string[])?.map((v) => ({ text: v }))
          : f.Panel.type === "block"
          ? f.defaultValue
            ? [f.defaultValue as InputTextNode]
            : []
          : [{ text: `${f.defaultValue}` }],
    }));

const createConfigPage = ({
  title,
  config,
}: {
  title: string;
  config: Config;
}) => {
  const homeTab =
    "tabs" in config
      ? config.tabs.find((t) => /home/i.test(t.id))?.fields
      : config;
  const rawTree = [
    ...(homeTab ? fieldsToChildren(homeTab) : []),
    ...("tabs" in config
      ? config.tabs
          .filter((t) => !/home/i.test(t.id) && !t.toggleable && !t.development)
          .map((t) => ({
            text: t.id,
            children: fieldsToChildren(t.fields),
          }))
      : []),
  ];
  return createPage({
    title,
    tree: rawTree.length ? rawTree : [{ text: " " }],
  });
};

export const render = ({
  h,
  title,
  pageUid = getPageUidByPageTitle(title),
  config,
}: {
  h: HTMLHeadingElement;
  title: string;
  pageUid?: string;
  config: Config;
}) => {
  const uid = getPageUidByPageTitle(title);
  const attribute = `data-roamjs-${uid}`;
  const containerParent = h.parentElement?.parentElement;
  if (containerParent && !containerParent.hasAttribute(attribute)) {
    containerParent.setAttribute(attribute, "true");
    const parent = document.createElement("div");
    const configPageId = title.split("/").slice(-1)[0];
    parent.id = `${configPageId}-config`;
    containerParent.insertBefore(
      parent,
      h.parentElement?.nextElementSibling || null
    );
    ReactDOM.render(
      <ConfigPage id={configPageId} config={config} pageUid={pageUid} />,
      parent
    );
  }
};

export const createConfigObserver = async ({
  title,
  config,
}: {
  title: string;
  config: Config;
}): Promise<{ pageUid: string; observer?: MutationObserver }> => {
  const pageUid =
    getPageUidByPageTitle(title) ||
    (await createConfigPage({
      title,
      config,
    }));
  if ("tabs" in config ? !!config.tabs.length : !!config.length) {
    const observer = createHTMLObserver({
      className: "rm-title-display",
      tag: "H1",
      callback: (d: HTMLElement) => {
        const h = d as HTMLHeadingElement;
        if (h.innerText === title) {
          render({
            pageUid,
            config,
            title,
            h,
          });
        }
      },
    });
    return {
      pageUid,
      observer,
    };
  }
  return {
    pageUid,
  };
};

export default ConfigPage;
