import {
  Button,
  Card,
  Checkbox,
  InputGroup,
  Label,
  NumericInput,
  Switch,
  Tab,
  Tabs,
} from "@blueprintjs/core";
import { TimePicker } from "@blueprintjs/datetime";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import ReactDOM from "react-dom";
import {
  addOldRoamJSDependency,
  createBlock,
  createHTMLObserver,
  createPage,
  deleteBlock,
  getBasicTreeByParentUid,
  getFirstChildUidByBlockUid,
  getPageUidByPageTitle,
  getShallowTreeByParentUid,
  getTextByBlockUid,
  getTreeByBlockUid,
  InputTextNode,
  localStorageGet,
  localStorageRemove,
  localStorageSet,
} from "roam-client";
import startOfDay from "date-fns/startOfDay";
import Description from "./Description";
import ExternalLogin, { ExternalLoginOptions } from "./ExternalLogin";
import { toTitle } from "./hooks";
import MenuItemSelect from "./MenuItemSelect";
import PageInput from "./PageInput";
import format from "date-fns/format";
import axios from "axios";

type TextField = {
  type: "text";
  defaultValue?: string;
};

type TimeField = {
  type: "time";
  defaultValue?: Date;
};

type NumberField = {
  type: "number";
  defaultValue?: number;
};

type FlagField = {
  type: "flag";
  defaultValue?: boolean;
};

type MultiTextField = {
  type: "multitext";
  defaultValue?: string[];
};

type PagesField = {
  type: "pages";
  defaultValue?: string[];
};

type OauthField = {
  type: "oauth";
  defaultValue?: [];
  options: ExternalLoginOptions;
};

type SelectField = {
  type: "select";
  defaultValue?: string;
  options: {
    items: string[];
  };
};

type CustomField = {
  type: "custom";
  defaultValue?: InputTextNode[];
  options: {
    component: React.FC<{ parentUid: string; uid?: string }>;
  };
};

type ArrayField = PagesField | MultiTextField | CustomField;
type UnionField =
  | ArrayField
  | TextField
  | TimeField
  | NumberField
  | OauthField
  | FlagField
  | SelectField;

type Field<T extends UnionField> = T & {
  title: string;
  description: string;
};

type FieldPanel<T extends UnionField, U = Record<string, unknown>> = (
  props: {
    order: number;
    uid?: string;
    parentUid: string;
  } & Omit<Field<T>, "type"> &
    U
) => React.ReactElement;

const useSingleChildValue = <T extends string | number | Date>({
  defaultValue,
  uid: initialUid,
  title,
  parentUid,
  order,
  transform,
  toStr,
}: {
  title: string;
  parentUid: string;
  order: number;
  uid?: string;
  defaultValue: T;
  transform: (s: string) => T;
  toStr: (t: T) => string;
}): { value: T; onChange: (v: T) => void } => {
  const [uid, setUid] = useState(initialUid);
  const [valueUid, setValueUid] = useState(
    uid && getFirstChildUidByBlockUid(uid)
  );
  const [value, setValue] = useState(
    (valueUid && transform(getTextByBlockUid(valueUid))) || defaultValue
  );
  const onChange = useCallback(
    (v: T) => {
      setValue(v);
      if (valueUid) {
        window.roamAlphaAPI.updateBlock({
          block: { string: toStr(v), uid: valueUid },
        });
      } else if (uid) {
        const newValueUid = window.roamAlphaAPI.util.generateUID();
        window.roamAlphaAPI.createBlock({
          block: { string: toStr(v), uid: newValueUid },
          location: { order: 0, "parent-uid": uid },
        });
        setValueUid(newValueUid);
      } else {
        const newUid = window.roamAlphaAPI.util.generateUID();
        window.roamAlphaAPI.createBlock({
          block: { string: title, uid: newUid },
          location: { order, "parent-uid": parentUid },
        });
        setTimeout(() => setUid(newUid));
        const newValueUid = window.roamAlphaAPI.util.generateUID();
        window.roamAlphaAPI.createBlock({
          block: { string: toStr(v), uid: newValueUid },
          location: { order: 0, "parent-uid": newUid },
        });
        setValueUid(newValueUid);
      }
    },
    [setValue, setValueUid, title, parentUid, order, uid, setUid]
  );
  return { value, onChange };
};

const MultiChildPanel: FieldPanel<
  ArrayField,
  {
    InputComponent: (props: {
      value: string;
      setValue: (s: string) => void;
    }) => React.ReactElement;
  }
> = ({
  uid: initialUid,
  title,
  description,
  order,
  parentUid,
  InputComponent,
}) => {
  const [uid, setUid] = useState(initialUid);
  const [texts, setTexts] = useState(() =>
    uid
      ? getShallowTreeByParentUid(uid)
      : []
  );
  const [value, setValue] = useState("");
  return (
    <>
      <Label>
        {title}
        <Description description={description} />
        <div style={{ display: "flex" }}>
          <InputComponent value={value} setValue={setValue} />
          <Button
            icon={"plus"}
            minimal
            disabled={!value}
            onClick={() => {
              const valueUid = window.roamAlphaAPI.util.generateUID();
              if (uid) {
                window.roamAlphaAPI.createBlock({
                  location: { "parent-uid": uid, order: texts.length },
                  block: { string: value, uid: valueUid },
                });
              } else {
                const newUid = window.roamAlphaAPI.util.generateUID();
                window.roamAlphaAPI.createBlock({
                  block: { string: title, uid: newUid },
                  location: { order, "parent-uid": parentUid },
                });
                setTimeout(() => setUid(newUid));
                window.roamAlphaAPI.createBlock({
                  block: { string: value, uid: valueUid },
                  location: { order: 0, "parent-uid": newUid },
                });
              }
              setTexts([...texts, { text: value, uid: valueUid }]);
              setValue("");
            }}
          />
        </div>
      </Label>
      {texts.map((p) => (
        <div
          key={p.uid}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span
            style={{
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              overflow: "hidden",
            }}
          >
            {p.text}
          </span>
          <Button
            icon={"trash"}
            minimal
            onClick={() => {
              window.roamAlphaAPI.deleteBlock({ block: { uid: p.uid } });
              setTexts(texts.filter((f) => f.uid !== p.uid));
            }}
          />
        </div>
      ))}
    </>
  );
};

const TextPanel: FieldPanel<TextField> = ({
  title,
  uid,
  parentUid,
  order,
  description,
  defaultValue = "",
}) => {
  const { value, onChange } = useSingleChildValue({
    defaultValue,
    title,
    uid,
    parentUid,
    order,
    transform: (s) => s,
    toStr: (s) => s,
  });
  return (
    <Label>
      {title}
      <Description description={description} />
      <InputGroup
        value={value}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          onChange(e.target.value)
        }
      />
    </Label>
  );
};

const TimePanel: FieldPanel<TimeField> = ({
  title,
  uid,
  parentUid,
  order,
  description,
  defaultValue = startOfDay(new Date()),
}) => {
  const { value, onChange } = useSingleChildValue({
    defaultValue,
    title,
    uid,
    parentUid,
    order,
    transform: (s) => {
      const d = new Date();
      const [hours, minutes] = s.split(":");
      d.setHours(Number(hours));
      d.setMinutes(Number(minutes));
      return d;
    },
    toStr: (v) => format(v, "HH:mm"),
  });
  return (
    <Label>
      {title}
      <Description description={description} />
      <TimePicker value={value} onChange={onChange} showArrowButtons />
    </Label>
  );
};

const NumberPanel: FieldPanel<NumberField> = ({
  title,
  uid,
  parentUid,
  order,
  description,
  defaultValue = 0,
}) => {
  const { value, onChange } = useSingleChildValue({
    defaultValue,
    title,
    uid,
    parentUid,
    order,
    transform: parseInt,
    toStr: (v) => `${v}`,
  });
  return (
    <Label>
      {title}
      <Description description={description} />
      <NumericInput value={value} onValueChange={onChange} />
    </Label>
  );
};

const SelectPanel: FieldPanel<SelectField> = ({
  title,
  uid,
  parentUid,
  order,
  description,
  defaultValue = "",
  options: { items },
}) => {
  const { value, onChange } = useSingleChildValue({
    defaultValue: defaultValue || items[0],
    title,
    uid,
    parentUid,
    order,
    transform: (s) => s,
    toStr: (s) => s,
  });
  return (
    <Label>
      {title}
      <Description description={description} />
      <MenuItemSelect
        activeItem={value}
        onItemSelect={(e) => onChange(e)}
        items={items}
      />
    </Label>
  );
};

const FlagPanel: FieldPanel<FlagField> = ({
  title,
  uid: initialUid,
  parentUid,
  order,
  description,
}) => {
  const [uid, setUid] = useState(initialUid);
  return (
    <Checkbox
      checked={!!uid}
      onChange={(e) => {
        if ((e.target as HTMLInputElement).checked) {
          const newUid = window.roamAlphaAPI.util.generateUID();
          window.roamAlphaAPI.createBlock({
            block: { string: title, uid: newUid },
            location: { order, "parent-uid": parentUid },
          });
          setTimeout(() => setUid(newUid), 1);
        } else {
          window.roamAlphaAPI.deleteBlock({ block: { uid } });
          setUid("");
        }
      }}
      labelElement={
        <>
          {title}
          <Description description={description} />
        </>
      }
    />
  );
};

const MultiTextPanel: FieldPanel<MultiTextField> = (props) => {
  return (
    <MultiChildPanel
      {...props}
      InputComponent={({ value, setValue }) => (
        <InputGroup value={value} onChange={(e) => setValue(e.target.value)} />
      )}
    />
  );
};

const PagesPanel: FieldPanel<PagesField> = (props) => {
  return (
    <MultiChildPanel
      {...props}
      InputComponent={(inputProps) => (
        <PageInput extra={["{all}"]} {...inputProps} />
      )}
    />
  );
};

const OauthPanel: FieldPanel<OauthField> = ({
  uid,
  parentUid,
  description,
  options,
}) => {
  const key = `oauth-${options.service}`;
  const [useLocal, setUseLocal] = useState(!!localStorageGet(key));
  const [accounts, setAccounts] = useState<
    { text: string; uid: string; data: string }[]
  >(() =>
    useLocal
      ? JSON.parse(localStorageGet(key) as string)
      : uid
      ? getTreeByBlockUid(uid).children.map((v) => ({
          text: v.children[0]?.text ? v.text : "Default Account",
          uid: v.uid,
          data: v.children[0]?.text || v.text,
        }))
      : []
  );
  const onCheck = useCallback(
    (e) => {
      const checked = (e.target as HTMLInputElement).checked;
      setUseLocal(checked);
      if (checked) {
        if (uid) {
          getShallowTreeByParentUid(uid).forEach(({ uid: u }) =>
            deleteBlock(u)
          );
        }
        localStorageSet(key, JSON.stringify(accounts));
      } else {
        localStorageRemove(key);
        if (uid) {
          accounts.forEach(({ text, uid: u, data }, order) => {
            window.roamAlphaAPI.createBlock({
              location: { "parent-uid": uid, order },
              block: { string: text, uid: u },
            });
            window.roamAlphaAPI.createBlock({
              location: { "parent-uid": u, order: 0 },
              block: { string: data },
            });
          });
        }
      }
    },
    [setUseLocal, accounts, uid, key]
  );
  return (
    <>
      <Checkbox
        labelElement={
          <>
            Store Locally
            <Description
              description={
                "If checked, sensitive authentication data will be stored locally on your machine and will require re-logging in per device. If unchecked, sensitive authentication data will be stored in your Roam Graph."
              }
            />
          </>
        }
        checked={useLocal}
        onChange={onCheck}
      />
      <Label>
        Log In
        <Description description={description} />
      </Label>
      <ExternalLogin
        useLocal={useLocal}
        onSuccess={(acc) => setAccounts([...accounts, acc])}
        parentUid={parentUid}
        {...options}
      />
      <ul style={{ marginTop: 8, padding: 0 }}>
        {accounts.map((act) => (
          <li
            key={act.uid}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: 8,
            }}
          >
            <span style={{ minWidth: 192 }}>{act.text}</span>
            <Button
              text={"Log Out"}
              onClick={() => {
                if (useLocal) {
                  const accts = JSON.parse(localStorageGet(key) as string) as {
                    uid: string;
                  }[];
                  localStorageSet(
                    key,
                    JSON.stringify(accts.filter((a) => act.uid !== a.uid))
                  );
                } else {
                  deleteBlock(act.uid);
                }
                setAccounts(accounts.filter((a) => act.uid !== a.uid));
              }}
            />
          </li>
        ))}
      </ul>
    </>
  );
};

const CustomPanel: FieldPanel<CustomField> = ({
  description,
  title,
  uid,
  options: { component: Component },
  parentUid,
}) => (
  <>
    <Label>
      {title}
      <Description description={description} />
    </Label>
    <Component uid={uid} parentUid={parentUid} />
  </>
);

const Panels = {
  text: TextPanel,
  time: TimePanel,
  number: NumberPanel,
  flag: FlagPanel,
  pages: PagesPanel,
  oauth: OauthPanel,
  multitext: MultiTextPanel,
  select: SelectPanel,
  custom: CustomPanel,
} as { [UField in UnionField as UField["type"]]: FieldPanel<UField> };

type ConfigTab = {
  id: string;
  toggleable?: boolean;
  fields: Field<UnionField>[];
};

type Config = {
  tabs: ConfigTab[];
  versioning?: boolean;
};

const FieldTabs = ({
  id,
  fields,
  uid: initialUid,
  pageUid,
  order,
  toggleable,
}: {
  uid: string;
  pageUid: string;
  order: number;
} & ConfigTab) => {
  const [uid, setUid] = useState(initialUid);
  const subTree = useMemo(
    () => (uid ? getTreeByBlockUid(uid) : undefined),
    [uid]
  );
  const parentUid = useMemo(
    () =>
      /home/i.test(id)
        ? pageUid
        : subTree?.uid ||
          (toggleable
            ? ""
            : createBlock({
                parentUid: pageUid,
                order,
                node: { text: id },
              })),
    [pageUid, subTree, id, toggleable]
  );
  const childUids = Object.fromEntries(
    getShallowTreeByParentUid(parentUid).map(({ text, uid }) => [
      text.toLowerCase().trim(),
      uid,
    ])
  );
  const [enabled, setEnabled] = useState(!toggleable || !!parentUid);
  const [selectedTabId, setSelectedTabId] = useState(
    enabled && fields.length ? fields[0].title : "enabled"
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
            <Switch
              labelElement={"Enabled"}
              checked={enabled}
              onChange={(e) => {
                const checked = (e.target as HTMLInputElement).checked;
                setEnabled(checked);
                if (checked) {
                  const newUid = window.roamAlphaAPI.util.generateUID();
                  window.roamAlphaAPI.createBlock({
                    location: { "parent-uid": pageUid, order },
                    block: { string: id, uid: newUid },
                  });
                  setTimeout(() => setUid(newUid));
                } else {
                  window.roamAlphaAPI.deleteBlock({ block: { uid } });
                  setUid("");
                }
              }}
            />
          }
        />
      )}
      {fields.map((field, i) => {
        const { type, title, defaultValue } = field;
        const Panel = Panels[type];
        return (
          <Tab
            id={title}
            key={title}
            title={title}
            disabled={!enabled}
            panel={
              <Panel
                {...field}
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore 4.3.0
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
  const userTabs = config.tabs.filter((t) => t.fields.length || t.toggleable);
  const [selectedTabId, setSelectedTabId] = useState(userTabs[0]?.id);
  const onTabsChange = useCallback(
    (tabId: string) => setSelectedTabId(tabId),
    [setSelectedTabId]
  );
  const tree = getBasicTreeByParentUid(pageUid);
  const [currentVersion, setCurrentVersion] = useState("");
  useEffect(() => {
    if (config.versioning) {
      addOldRoamJSDependency("versioning");
      const scriptVersionMatch =
        document.currentScript &&
        (document.currentScript as HTMLScriptElement).src.match(
          new RegExp(
            `${id}\\/(\\d\\d\\d\\d-\\d\\d-\\d\\d-\\d\\d-\\d\\d)\\/main.js/`
          )
        );
      if (scriptVersionMatch) {
        setCurrentVersion(scriptVersionMatch[1]);
      } else {
        axios
          .get(`https://api.roamjs.com/versions?limit=1&id=${id}`)
          .then(({ data: { versions } }) => {
            setCurrentVersion(versions[0] || "Version Not Found");
          })
          .catch(() => {
            setCurrentVersion("Version Not Found");
          });
      }
    }
  }, [config.versioning, id, setCurrentVersion]);
  return (
    <Card style={{ color: "#202B33" }} className={"roamjs-config-panel"}>
      <style>
        {`.roamjs-config-panel .bp3-tab-panel {
  width: 100%;
}`}
      </style>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h4 style={{ padding: 4 }}>{toTitle(id)} Configuration</h4>
        {currentVersion && (
          <span>
            <span style={{ color: "#cccccc", fontSize: 8 }}>
              v{currentVersion}
            </span>
            <Button
              icon={"git-branch"}
              minimal
              onClick={() =>
                window.roamjs?.extension.versioning.switch({
                  id,
                  currentVersion,
                })
              }
              style={{ marginLeft: 4 }}
            />
          </span>
        )}
      </div>
      <Tabs
        vertical
        id={`${id}-config-tabs`}
        onChange={onTabsChange}
        selectedTabId={selectedTabId}
      >
        {userTabs.map(({ id: tabId, fields, toggleable }, i) => (
          <Tab
            id={tabId}
            key={tabId}
            title={tabId}
            panel={
              <FieldTabs
                id={tabId}
                fields={fields}
                uid={
                  tree.find((t) => new RegExp(tabId, "i").test(t.text))?.uid ||
                  ""
                }
                pageUid={pageUid}
                order={i}
                toggleable={!!toggleable}
              />
            }
          />
        ))}
      </Tabs>
    </Card>
  );
};

const fieldsToChildren = (t: ConfigTab) =>
  t.fields
    .filter((f) => !!f.defaultValue)
    .map((f) => ({
      text: f.title,
      children:
        f.type === "flag"
          ? []
          : f.type === "custom"
          ? f.defaultValue || []
          : f.type === "pages" || f.type === "multitext"
          ? f.defaultValue?.map((v) => ({ text: v }))
          : [{ text: `${f.defaultValue}` }],
    }));

export const createConfigObserver = ({
  title,
  config,
}: {
  title: string;
  config: Config;
}): { pageUid: string } => {
  const pageUid =
    getPageUidByPageTitle(title) ||
    createPage({
      title,
      tree: [
        ...(config.tabs.some((t) => /home/i.test(t.id))
          ? fieldsToChildren(
              config.tabs.find((t) => /home/i.test(t.id)) as ConfigTab
            )
          : []),
        ...config.tabs
          .filter((t) => !/home/i.test(t.id) && !t.toggleable)
          .map((t) => ({
            text: t.id,
            children: fieldsToChildren(t),
          })),
      ],
    });
  if (config.tabs.length) {
    createHTMLObserver({
      className: "rm-title-display",
      tag: "H1",
      callback: (d: HTMLElement) => {
        const h = d as HTMLHeadingElement;
        if (h.innerText === title) {
          const uid = getPageUidByPageTitle(title);
          const attribute = `data-roamjs-${uid}`;
          const containerParent = h.parentElement?.parentElement;
          if (containerParent && !containerParent.hasAttribute(attribute)) {
            containerParent.setAttribute(attribute, "true");
            const parent = document.createElement("div");
            parent.id = `${title.replace("roam/js/", "roamjs-")}-config`;
            containerParent.insertBefore(
              parent,
              d.parentElement?.nextElementSibling || null
            );
            ReactDOM.render(
              <ConfigPage
                id={title.replace("roam/js/", "")}
                config={config}
                pageUid={pageUid}
              />,
              parent
            );
          }
        }
      },
    });
  }
  return {
    pageUid,
  };
};

export default ConfigPage;
