import {
  Alert,
  Button,
  Card,
  Intent,
  Spinner,
  Switch,
  Tab,
  Tabs,
} from "@blueprintjs/core";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import ReactDOM from "react-dom";
import createHTMLObserver from "../dom/createHTMLObserver";
import createBlock from "../writes/createBlock";
import createPage from "../writes/createPage";
import deleteBlock from "../writes/deleteBlock";
import getBasicTreeByParentUid from "../queries/getBasicTreeByParentUid";
import getPageUidByPageTitle from "../queries/getPageUidByPageTitle";
import getShallowTreeByParentUid from "../queries/getShallowTreeByParentUid";
import localStorageGet from "../util/localStorageGet";
import idToTitle from "../util/idToTitle";
import { checkRoamJSTokenWarning } from "./TokenDialog";
import apiGet from "../util/apiGet";
import apiPost from "../util/apiPost";
import type { Field, UnionField } from "./ConfigPanels/types";
import { Brand } from "./ConfigPanels/getBrandColors";
import { InputTextNode } from "../types";
import { VersionSwitcherProps } from "./VersionSwitcher";

const ToggleablePanel = ({
  enabled,
  setEnabled,
  pageUid,
  order,
  id,
  extensionId,
  setUid,
  uid,
  toggleable,
  onEnable,
  onDisable,
}: {
  uid: string;
  id: string;
  extensionId: string;
  pageUid: string;
  order: number;
  enabled: boolean;
  toggleable: Exclude<Required<ConfigTab["toggleable"]>, false | undefined>;
  setEnabled: (b: boolean) => void;
  setUid: (s: string) => void;
  onEnable?: () => void;
  onDisable?: () => void;
}) => {
  const uidRef = useRef(uid);
  const isPremium = useMemo(() => toggleable !== true, [toggleable]);
  const dev = useMemo(
    () =>
      ["dev", "ngrok", "localhost"].some((s) =>
        (process.env.API_URL || "").includes(s)
      )
        ? "&dev=true"
        : "",
    []
  );
  const [productDescription, setProductDescription] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(isPremium);
  const [alertLoading, setAlertLoading] = useState(false);
  const enableCallback = useCallback(
    (checked: boolean, uid: string) => {
      setEnabled(checked);
      if (checked) {
        createBlock({
          parentUid: pageUid,
          order,
          node: { text: id },
        })
          .then((newUid) => {
            setUid(newUid);
            uidRef.current = newUid;
          })
          .then(() => onEnable?.());
      } else {
        deleteBlock(uid)
          .then(() => {
            setUid("");
            uidRef.current = "";
          })
          .then(() => onDisable?.());
      }
    },
    [setUid, setEnabled, id, pageUid, order, onEnable, onDisable]
  );
  const [isOpen, setIsOpen] = useState(false);
  const intervalListener = useRef(0);
  const catchError = useCallback((e: Error) => setError(e.message), [setError]);
  useEffect(() => {
    if (isPremium) {
      apiGet<{ description: string }>({
        domain: "https://lambda.roamjs.com",
        path: `price?extensionId=${extensionId}${dev}`,
        anonymous: true,
      })
        .then((r) => {
          setProductDescription(
            r.description || "No extension specific description found."
          );
        })
        .catch(catchError);
    }
  }, [isPremium, setProductDescription, dev]);
  const checkSubscription = useCallback(
    (token: string) => {
      setLoading(true);
      setError("");
      setEnabled(false);
      (token
        ? apiGet<{ success: boolean }>({
            domain: "https://lambda.roamjs.com",
            path: `check?extensionId=${extensionId}${dev}`,
          }).then((r) => {
            if (!r.success && uidRef.current) {
              enableCallback(false, uidRef.current);
            } else if (r.success && !uidRef.current) {
              enableCallback(true, uidRef.current);
            } else {
              setEnabled(r.success);
            }
          })
        : Promise.reject(
            new Error(
              `Must set a RoamJS token in order to use these features. To set your RoamJS token, open the Roam command palette and enter "Set RoamJS Token"`
            )
          )
      )
        .catch((e) => {
          if (uidRef.current) enableCallback(false, uidRef.current);
          catchError(e);
        })
        .finally(() => setLoading(false));
    },
    [catchError, extensionId, dev, uidRef, enableCallback, setLoading, setError]
  );
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (isPremium) {
      checkRoamJSTokenWarning().then(checkSubscription);
      if (containerRef.current)
        containerRef.current?.addEventListener("roamjs:token:set", ((
          e: CustomEvent
        ) => checkSubscription(e.detail)) as EventListener);
    }
    return () => clearTimeout(intervalListener.current);
  }, [isPremium, checkSubscription]);
  return (
    <div id={"roamjs-toggleable-container"} ref={containerRef}>
      {loading ? (
        <div
          style={{
            whiteSpace: "pre-wrap",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <span style={{ opacity: 0.75 }}>
            Checking to see if you are subscribed to RoamJS{" "}
            {idToTitle(extensionId)}...
          </span>
          <Spinner size={16} />
        </div>
      ) : (
        <>
          <Switch
            labelElement={enabled ? "Enabled" : "Disabled"}
            checked={enabled}
            onChange={(e) =>
              isPremium
                ? setIsOpen(true)
                : enableCallback((e.target as HTMLInputElement).checked, uid)
            }
          />
          <p style={{ whiteSpace: "pre-wrap" }}>
            {isPremium &&
              (enabled
                ? `You have sucessfully subscribed!\n\nConfigure this feature with the tabs on the left.`
                : `This is a premium feature and will require a paid subscription to enable.\n\n${productDescription}`)}
          </p>
        </>
      )}
      <p style={{ color: "red" }}>{error}</p>
      <Alert
        isOpen={isOpen}
        onConfirm={() => {
          setAlertLoading(true);
          setError("");
          if (enabled) {
            apiPost({
              domain: "https://lambda.roamjs.com",
              path: `unsubscribe`,
              data: {
                extensionId,
                dev: !!dev,
              },
            })
              .then(() => {
                enableCallback(false, uid);
              })
              .catch(catchError)
              .finally(() => {
                setAlertLoading(false);
                setIsOpen(false);
              });
          } else {
            apiPost<{ url: string; success: boolean }>({
              domain: "https://lambda.roamjs.com",
              path: `subscribe`,
              data: {
                extensionId,
                dev: !!dev,
              },
            })
              .then((r) => {
                if (r.url) {
                  const width = 600;
                  const height = 525;
                  const left = window.screenX + (window.innerWidth - width) / 2;
                  const top =
                    window.screenY + (window.innerHeight - height) / 2;
                  window.open(
                    r.url,
                    `roamjs:roamjs:stripe`,
                    `left=${left},top=${top},width=${width},height=${height},status=1`
                  );
                  const authInterval = () => {
                    apiGet<{ success: boolean }>({
                      path: `check?extensionId=${extensionId}${dev}`,
                      domain: "https://lambda.roamjs.com",
                    })
                      .then((r) => {
                        if (r.success) {
                          enableCallback(true, uid);
                          setAlertLoading(false);
                          setIsOpen(false);
                        } else {
                          intervalListener.current = window.setTimeout(
                            authInterval,
                            2000
                          );
                        }
                      })
                      .catch((e) => {
                        catchError(e);
                        setAlertLoading(false);
                        setIsOpen(false);
                      });
                  };
                  authInterval();
                } else if (r.success) {
                  enableCallback(true, uid);
                  setAlertLoading(false);
                  setIsOpen(false);
                } else {
                  setError(
                    "Something went wrong with the subscription. Please contact support@roamjs.com for help!"
                  );
                  setAlertLoading(false);
                  setIsOpen(false);
                }
              })
              .catch(catchError)
              .finally(() => {
                setAlertLoading(false);
                setIsOpen(false);
              });
          }
        }}
        confirmButtonText={"Submit"}
        cancelButtonText={"Cancel"}
        intent={Intent.PRIMARY}
        loading={alertLoading}
        onCancel={() => setIsOpen(false)}
      >
        {enabled
          ? `By clicking submit below, you will unsubscribe from the premium features of the RoamJS Extension: ${idToTitle(
              extensionId
            )}`
          : `By clicking submit below, you will subscribe to the premium features of the RoamJS Extension: ${idToTitle(
              extensionId
            )}.\n\nA window may appear for checkout if this is your first premium extension.`}
      </Alert>
    </div>
  );
};

type ConfigTab = {
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
      versioning?: boolean | ((props: VersionSwitcherProps) => void);
      brand?: Brand;
    }
  | Field<UnionField>[];

const FieldTabs = ({
  id,
  fields,
  uid: initialUid,
  pageUid,
  order,
  toggleable,
  extensionId,
  onEnable,
  onDisable,
}: {
  uid: string;
  pageUid: string;
  order: number;
  extensionId: string;
} & ConfigTab) => {
  const [uid, setUid] = useState(initialUid);
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
  const [enabled, setEnabled] = useState(!toggleable || !!parentUid);
  const [selectedTabId, setSelectedTabId] = useState(
    enabled && fields.length && typeof toggleable !== "string"
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
      {toggleable && (
        <Tab
          id={"enabled"}
          title={"enabled"}
          panel={
            selectedTabId === "enabled" ? (
              <ToggleablePanel
                id={id}
                uid={uid}
                pageUid={pageUid}
                extensionId={extensionId}
                enabled={enabled}
                order={order}
                toggleable={toggleable}
                setUid={setUid}
                setEnabled={setEnabled}
                onEnable={onEnable}
                onDisable={onDisable}
              />
            ) : undefined
          }
        />
      )}
      {fields.map((field, i) => {
        const { Panel, title, defaultValue } = field;
        return (
          <Tab
            id={title}
            key={title}
            title={idToTitle(title)}
            disabled={!enabled}
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
  const currentVersion = window.roamjs?.version?.[id] || "ersion not set";
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
        <span>
          <span style={{ color: "#cccccc", fontSize: 8 }}>
            v{currentVersion}
          </span>
          {"versioning" in config && typeof config.versioning === "function" && (
            <Button
              icon={"git-branch"}
              minimal
              onClick={() =>
                typeof config.versioning === "function" &&
                config.versioning({
                  id,
                  currentVersion,
                })
              }
              style={{ marginLeft: 4 }}
            />
          )}
        </span>
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
