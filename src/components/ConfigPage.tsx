import {
  Alert,
  Button,
  Card,
  Checkbox,
  InputGroup,
  Intent,
  Label,
  NumericInput,
  Switch,
  Tab,
  Tabs,
} from "@blueprintjs/core";
import { TimePicker } from "@blueprintjs/datetime";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import ReactDOM from "react-dom";
import { addOldRoamJSDependency, createHTMLObserver } from "../dom";
import { createBlock, createPage, deleteBlock } from "../writes";
import {
  getBasicTreeByParentUid,
  getFirstChildUidByBlockUid,
  getPageUidByPageTitle,
  getShallowTreeByParentUid,
  getTextByBlockUid,
} from "../queries";
import type { InputTextNode } from "../types";
import localStorageGet from "../util/localStorageGet";
import localStorageRemove from "../util/localStorageRemove";
import localStorageSet from "../util/localStorageSet";
import startOfDay from "date-fns/startOfDay";
import Description from "./Description";
import ExternalLogin, { ExternalLoginOptions } from "./ExternalLogin";
import idToTitle from "../util/idToTitle";
import MenuItemSelect from "./MenuItemSelect";
import PageInput from "./PageInput";
import format from "date-fns/format";
import axios, { AxiosError } from "axios";
import Color from "color";
import useRoamJSTokenWarning from "../hooks/useRoamJSTokenWarning";
import getAuthorizationHeader from "../util/getAuthorizationHeader";

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
  options?: {
    onChange?: (f: boolean) => void;
  };
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

type BlockField = {
  type: "block";
  defaultValue?: InputTextNode;
};

type BlocksField = {
  type: "blocks";
  defaultValue?: InputTextNode[];
};

type CustomField = {
  type: "custom";
  defaultValue?: InputTextNode[];
  options: {
    component: React.FC<{
      parentUid: string;
      uid: string;
      defaultValue: InputTextNode[];
      title: string;
    }>;
  };
};

type ArrayField = PagesField | MultiTextField | CustomField | BlocksField;
type UnionField =
  | ArrayField
  | TextField
  | TimeField
  | NumberField
  | OauthField
  | FlagField
  | SelectField
  | BlockField;

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
    [setValue, setValueUid, title, parentUid, order, uid, valueUid, setUid]
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
    uid ? getShallowTreeByParentUid(uid) : []
  );
  const [value, setValue] = useState("");
  return (
    <>
      <Label>
        {idToTitle(title)}
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
      {idToTitle(title)}
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
      {idToTitle(title)}
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
      {idToTitle(title)}
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
      {idToTitle(title)}
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
  options = {},
}) => {
  const [uid, setUid] = useState(initialUid);
  return (
    <Checkbox
      checked={!!uid}
      onChange={(e) => {
        const { checked } = e.target as HTMLInputElement;
        if (checked) {
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
        options.onChange?.(checked);
      }}
      labelElement={
        <>
          {idToTitle(title)}
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

const OauthPanel: FieldPanel<OauthField> = ({ uid, parentUid, options }) => {
  const key = `oauth-${options.service}`;
  const [useLocal, setUseLocal] = useState(!!localStorageGet(key));
  const [accounts, setAccounts] = useState<
    { text: string; uid: string; data: string }[]
  >(() =>
    useLocal
      ? JSON.parse(localStorageGet(key) as string)
      : uid
      ? getBasicTreeByParentUid(uid).map((v) => ({
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
      <ExternalLogin
        useLocal={useLocal}
        onSuccess={(acc) => setAccounts([...accounts, acc])}
        parentUid={parentUid}
        loggedIn={!!accounts.length}
        {...options}
      />
      {!!accounts.length && (
        <>
          <h5 style={{ marginTop: 8 }}>Accounts</h5>
          <hr />
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
                      const accts = JSON.parse(
                        localStorageGet(key) as string
                      ) as {
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
      )}
    </>
  );
};

const BlockPanel: FieldPanel<BlockField> = ({
  uid: initialUid,
  parentUid,
  title,
  defaultValue,
  description,
}) => {
  const containerRef = useRef(null);
  useEffect(() => {
    if (containerRef.current) {
      const el = containerRef.current;
      (initialUid
        ? Promise.resolve(initialUid)
        : createBlock({ node: { text: title, children: [] }, parentUid })
      )
        .then(
          (formatUid) =>
            getFirstChildUidByBlockUid(formatUid) ||
            createBlock({
              node: defaultValue || { text: " " },
              parentUid: formatUid,
            })
        )
        .then((uid) => {
          window.roamAlphaAPI.ui.components.renderBlock({
            uid,
            el,
          });
        });
    }
  }, [containerRef, defaultValue]);
  return (
    <>
      <Label>
        {idToTitle(title)}
        <Description description={description} />
      </Label>
      <div
        ref={containerRef}
        style={{
          border: "1px solid #33333333",
          padding: "8px 0",
          borderRadius: 4,
        }}
      ></div>
    </>
  );
};

const BlocksPanel: FieldPanel<BlocksField> = ({
  uid: initialUid,
  parentUid,
  title,
  defaultValue,
  description,
}) => {
  const containerRef = useRef(null);
  useEffect(() => {
    if (containerRef.current) {
      const el = containerRef.current;
      (initialUid
        ? Promise.resolve(initialUid)
        : createBlock({ node: { text: title, children: [] }, parentUid })
      )
        .then(
          (formatUid) =>
            getFirstChildUidByBlockUid(formatUid) ||
            (defaultValue?.length
              ? Promise.all(
                  defaultValue.map((node, order) =>
                    createBlock({
                      node,
                      parentUid: formatUid,
                      order,
                    })
                  )
                )
              : createBlock({
                  node: { text: " " },
                  parentUid: formatUid,
                })
            ).then(() => formatUid)
        )
        .then((uid) => {
          window.roamAlphaAPI.ui.components.renderBlock({
            uid,
            el,
          });
        });
    }
  }, [containerRef, defaultValue]);
  return (
    <>
      <Label>
        {idToTitle(title)}
        <Description description={description} />
      </Label>
      <div
        ref={containerRef}
        style={{
          border: "1px solid #33333333",
          padding: "8px 0",
          borderRadius: 4,
        }}
      ></div>
    </>
  );
};

const CustomPanel: FieldPanel<CustomField> = ({
  description,
  title,
  uid: inputUid,
  options: { component: Component },
  parentUid,
  defaultValue = [],
  order,
}) => {
  const uid = useMemo(() => {
    if (inputUid) return inputUid;
    const newUid = window.roamAlphaAPI.util.generateUID();
    createBlock({ node: { text: title, uid: newUid }, parentUid, order });
    return newUid;
  }, [inputUid]);
  return (
    <>
      <Label>
        {idToTitle(title)}
        <Description description={description} />
      </Label>
      <Component
        uid={uid}
        parentUid={parentUid}
        title={title}
        defaultValue={defaultValue}
      />
    </>
  );
};

const RoamJSTokenWarning = () => {
  useRoamJSTokenWarning();
  return <></>;
};

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
  const initialUid = useRef(uid);
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
  const [pricingMessage, setPricingMessage] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const enableCallback = useCallback(
    (checked: boolean, uid: string) => {
      setEnabled(checked);
      if (checked) {
        createBlock({
          parentUid: pageUid,
          order,
          node: { text: id },
        })
          .then((newUid) => setUid(newUid))
          .then(() => onEnable?.());
      } else {
        deleteBlock(uid)
          .then(() => setUid(""))
          .then(() => onDisable?.());
      }
    },
    [setUid, setEnabled, id, pageUid, order, onEnable, onDisable]
  );
  const [isOpen, setIsOpen] = useState(false);
  const intervalListener = useRef(0);
  const catchError = useCallback(
    (e: AxiosError) =>
      setError(e.response?.data?.message || e.response?.data || e.message),
    [setError]
  );
  useEffect(() => {
    if (isPremium) {
      axios
        .get(
          `https://lambda.roamjs.com/price?extensionId=${extensionId}${dev}`,
          {
            headers: { Authorization: getAuthorizationHeader() },
          }
        )
        .then((r) => {
          setPricingMessage(
            `$${r.data.price / 100}${r.data.perUse ? " per use" : ""}${
              r.data.isMonthly ? " per month" : " per year"
            }`
          );
          setProductDescription(r.data.description);
        })
        .catch(catchError);
      axios
        .get(
          `https://lambda.roamjs.com/check?extensionId=${extensionId}${dev}`,
          { headers: { Authorization: getAuthorizationHeader() } }
        )
        .then((r) => {
          if (!r.data.success && initialUid.current) {
            enableCallback(false, initialUid.current);
          } else if (r.data.success && !initialUid.current) {
            enableCallback(true, initialUid.current);
          }
        })
        .catch(catchError);
    }
    return () => clearTimeout(intervalListener.current);
  }, [
    isPremium,
    toggleable,
    catchError,
    extensionId,
    dev,
    initialUid,
    enableCallback,
    setPricingMessage,
  ]);
  return (
    <>
      {isPremium && <RoamJSTokenWarning />}
      <Switch
        labelElement={"Enabled"}
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
      <p style={{ color: "red" }}>{error}</p>
      <Alert
        isOpen={isOpen}
        onConfirm={() => {
          setLoading(true);
          setError("");
          if (enabled) {
            axios
              .post(
                `https://lambda.roamjs.com/unsubscribe`,
                {
                  extensionId,
                  dev: !!dev,
                },
                { headers: { Authorization: getAuthorizationHeader() } }
              )
              .then(() => {
                enableCallback(false, uid);
              })
              .catch(catchError)
              .finally(() => {
                setLoading(false);
                setIsOpen(false);
              });
          } else {
            axios
              .post(
                `https://lambda.roamjs.com/subscribe`,
                {
                  extensionId,
                  dev: !!dev,
                },
                { headers: { Authorization: getAuthorizationHeader() } }
              )
              .then((r) => {
                if (r.data.url) {
                  const width = 600;
                  const height = 525;
                  const left = window.screenX + (window.innerWidth - width) / 2;
                  const top =
                    window.screenY + (window.innerHeight - height) / 2;
                  window.open(
                    r.data.url,
                    `roamjs:roamjs:stripe`,
                    `left=${left},top=${top},width=${width},height=${height},status=1`
                  );
                  const authInterval = () => {
                    axios
                      .get(
                        `https://lambda.roamjs.com/check?extensionId=${extensionId}${dev}`,
                        { headers: { Authorization: getAuthorizationHeader() } }
                      )
                      .then((r) => {
                        if (r.data.success) {
                          enableCallback(true, uid);
                          setLoading(false);
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
                        setLoading(false);
                        setIsOpen(false);
                      });
                  };
                  authInterval();
                } else if (r.data.success) {
                  enableCallback(true, uid);
                  setLoading(false);
                  setIsOpen(false);
                } else {
                  setError(
                    "Something went wrong with the subscription. Please contact support@roamjs.com for help!"
                  );
                  setLoading(false);
                  setIsOpen(false);
                }
              })
              .catch(catchError)
              .finally(() => {
                setLoading(false);
                setIsOpen(false);
              });
          }
        }}
        confirmButtonText={"Submit"}
        cancelButtonText={"Cancel"}
        intent={Intent.PRIMARY}
        loading={loading}
        onCancel={() => setIsOpen(false)}
      >
        {enabled
          ? `By clicking submit below, you will unsubscribe from the premium features of the RoamJS Extension: ${idToTitle(
              extensionId
            )}`
          : `By clicking submit below, you will subscribe to the premium features of the RoamJS Extension: ${idToTitle(
              extensionId
            )} for ${pricingMessage}. A window may appear for checkout if this is your first premium extension`}
      </Alert>
    </>
  );
};

const Panels = {
  text: TextPanel,
  time: TimePanel,
  number: NumberPanel,
  flag: FlagPanel,
  pages: PagesPanel,
  oauth: OauthPanel,
  multitext: MultiTextPanel,
  select: SelectPanel,
  block: BlockPanel,
  blocks: BlocksPanel,
  custom: CustomPanel,
} as { [UField in UnionField as UField["type"]]: FieldPanel<UField> };

type ConfigTab = {
  id: string;
  toggleable?: boolean | "premium";
  onEnable?: () => void;
  onDisable?: () => void;
  development?: boolean;
  fields: Field<UnionField>[];
};

type Config = {
  tabs: ConfigTab[];
  versioning?: boolean;
  brand?: string;
};

const tryColor = (s?: string) => {
  if (!s) return undefined;
  try {
    return Color(s);
  } catch (e) {
    return undefined;
  }
};

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
        const { type, title, defaultValue } = field;
        const Panel = Panels[type];
        return (
          <Tab
            id={title}
            key={title}
            title={idToTitle(title)}
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
  const [experimentalMode, setExperimentalMode] = useState(
    !!localStorageGet("experimental")
  );
  const titleRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (config.versioning) {
      addOldRoamJSDependency("versioning");
      const scriptVersionMatch = window.roamjs?.version?.[id];
      if (scriptVersionMatch) {
        setCurrentVersion(scriptVersionMatch);
      } else {
        setCurrentVersion("Version Not Found");
      }
    }
    if (userTabs.some((t) => t.development)) {
      titleRef.current?.addEventListener("keydown", (e) => {
        if (
          e.ctrlKey &&
          e.metaKey &&
          e.shiftKey &&
          e.altKey &&
          e.key === "KeyM"
        ) {
          const newVal = !localStorageGet("experimental");
          setExperimentalMode(newVal);
          if (newVal) localStorageSet("experimental", "true");
          else localStorageRemove("experimental");
        }
      });
    }
  }, [config.versioning, id, setCurrentVersion, userTabs, titleRef]);
  const brandColor = tryColor(config.brand);
  return (
    <Card style={{ color: "#202B33" }} className={"roamjs-config-panel"}>
      <style>
        {`.roamjs-config-panel .bp3-tab-panel {
  width: 100%;
  position: relative;
}
.roamjs-external-login {
  margin-bottom: 16px;
}
${
  brandColor &&
  `div.bp3-tab[aria-selected="true"], div.bp3-tab:not([aria-disabled="true"]):hover {
  color: ${brandColor.toString()};
}

.bp3-tab-indicator-wrapper div.bp3-tab-indicator, .bp3-control:hover input:checked ~ span.bp3-control-indicator {
  background-color: ${brandColor.toString()};
}

.bp3-tabs.bp3-vertical>.bp3-tab-list .bp3-tab-indicator-wrapper div.bp3-tab-indicator {
  background-color: ${brandColor
    .alpha(0.2)
    .lightness(brandColor.lightness() + 5)
    .toString()};
}

.bp3-control input:checked ~ span.bp3-control-indicator {
  background-color: ${brandColor
    .lightness(brandColor.lightness() + 5)
    .toString()}
}`
}`}
      </style>
      <div
        style={{ display: "flex", justifyContent: "space-between" }}
        ref={titleRef}
        tabIndex={-1}
      >
        <h4 style={{ padding: 4 }}>{idToTitle(id)} Configuration</h4>
        {currentVersion && (
          <span>
            <span style={{ color: "#cccccc", fontSize: 8 }}>
              v{currentVersion}
            </span>
            <Button
              icon={"git-branch"}
              minimal
              onClick={() =>
                window.roamjs?.extension.versioning &&
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
      <style>{`.roamjs-config-tabs {\npadding: 4px;\n}`}</style>
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
          : f.type === "block"
          ? f.defaultValue
            ? [f.defaultValue]
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
  const homeTab = config.tabs.find((t) => /home/i.test(t.id)) as ConfigTab;
  const rawTree = [
    ...(homeTab ? fieldsToChildren(homeTab) : []),
    ...config.tabs
      .filter((t) => !/home/i.test(t.id) && !t.toggleable && !t.development)
      .map((t) => ({
        text: t.id,
        children: fieldsToChildren(t),
      })),
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
}): Promise<{ pageUid: string }> => {
  const pageUid =
    getPageUidByPageTitle(title) ||
    (await createConfigPage({
      title,
      config,
    }));
  if (config.tabs.length) {
    createHTMLObserver({
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
  }
  return {
    pageUid,
  };
};

export default ConfigPage;
