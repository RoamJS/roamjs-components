import {
  Alert,
  Button,
  Card,
  Checkbox,
  InputGroup,
  Intent,
  Label,
  Panel,
  PanelProps,
  PanelStack2,
  ProgressBar,
} from "@blueprintjs/core";
import axios, { AxiosResponse } from "axios";
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import ReactDOM from "react-dom";
import {
  createPage,
  createPageTitleObserver,
  getPageUidByPageTitle,
  getTreeByPageName,
  localStorageGet,
  localStorageRemove,
  localStorageSet,
  TreeNode,
} from "roam-client";
import { getRenderRoot, toTitle, toFlexRegex, setInputSetting } from "./hooks";

declare global {
  interface Window {
    [key: `roamjs${string}Token`]: string;
  }
}

export const SERVICE_GUIDE_HIGHLIGHT = "3px dashed yellowgreen";

const toCamel = (service: string) =>
  service
    .split("-")
    .map((s, i) =>
      i === 0 ? s : `${s.substring(0, 1).toUpperCase()}${s.substring(1)}`
    )
    .join("");

export const getTokenFromTree = (tree: TreeNode[]): string =>
  tree.find((t) => /token/i.test(t.text))?.children?.[0]?.text || "";

export const isFieldInTree =
  (field = "$^") =>
  (tree: TreeNode[]): boolean =>
    tree.some((t) => new RegExp(field, "i").test(t.text));

export const useIsFieldSet = (field: string): boolean => {
  const service = useService();
  return isFieldInTree(field)(getTreeByPageName(`roam/js/${service}`));
};

export const useField = (field: string): string => {
  const service = useService();
  return (
    getTreeByPageName(`roam/js/${service}`).find((t) =>
      toFlexRegex(field).test(t.text)
    )?.children?.[0]?.text || ""
  );
};

export const useFieldVals = (field: string): string[] => {
  const service = useService();
  return (
    getTreeByPageName(`roam/js/${service}`).find((t) =>
      toFlexRegex(field).test(t.text)
    )?.children || []
  ).map((t) => t.text);
};

export const useAuthenticatedAxiosGet = (): ((
  path: string
) => Promise<AxiosResponse>) => {
  const service = useService();
  return useCallback(
    (path: string) =>
      axios.get(`${process.env.API_URL}/${path}`, {
        headers: { Authorization: getToken(service) },
      }),
    [service]
  );
};

export const useAuthenticatedAxiosPost = (): ((
  path: string,
  data?: Record<string, unknown>
) => Promise<AxiosResponse>) => {
  const service = useService();
  return useCallback(
    (path: string, data?: Record<string, unknown>) =>
      axios.post(`${process.env.API_URL}/${path}`, data || {}, {
        headers: { Authorization: getToken(service) },
      }),
    []
  );
};

export const useAuthenticatedAxiosPut = (): ((
  path: string,
  data?: Record<string, unknown>
) => Promise<AxiosResponse>) => {
  const service = useService();
  return useCallback(
    (path: string, data?: Record<string, unknown>) =>
      axios.put(`${process.env.API_URL}/${path}`, data || {}, {
        headers: { Authorization: getToken(service) },
      }),
    []
  );
};

export const useAuthenticatedAxiosDelete = (): ((
  path: string
) => Promise<AxiosResponse>) => {
  const service = useService();
  return useCallback(
    (path: string) =>
      axios.delete(`${process.env.API_URL}/${path}`, {
        headers: { Authorization: getToken(service) },
      }),
    []
  );
};

export const getToken = (service: string): string =>
  localStorageGet(`token-${service}`) ||
  getTokenFromTree(getTreeByPageName(`roam/js/${service}`));

export const runService = ({
  id,
  Dashboard,
}: {
  id: string;
  Dashboard: React.FC;
}): void => {
  const title = `roam/js/${id}` as const;

  createPageTitleObserver({
    title,
    callback: (d: HTMLDivElement) => {
      const parent = document.createElement("div");
      parent.id = `roamjs-${id}-dashboard`;
      const child = d.firstElementChild;
      if (child) {
        const ref = child.firstElementChild?.nextElementSibling;
        if (ref) {
          child.insertBefore(parent, ref);
          ReactDOM.render(<Dashboard />, parent);
          window.addEventListener(
            "hashchange",
            () => ReactDOM.unmountComponentAtNode(parent),
            { once: true }
          );
        }
      }
    },
  });

  if (!getPageUidByPageTitle(title)) {
    const root = getRenderRoot(id);
    ReactDOM.render(
      <Alert
        isOpen={true}
        onConfirm={() => {
          const tokenField = `roamjs${toCamel(id)}Token` as const;
          const tokenValue = window[tokenField];
          delete window[tokenField];
          const uid = createPage({
            title,
            tree: [
              tokenValue
                ? {
                    text: "token",
                    children: [
                      {
                        text: tokenValue,
                        children: [],
                      },
                    ],
                  }
                : { text: " " },
            ],
          });
          window.roamAlphaAPI.ui.mainWindow.openPage({
            page: { uid },
          });
          ReactDOM.unmountComponentAtNode(root);
          root.remove();
        }}
      >
        <h4>Welcome to RoamJS {toTitle(id)}!</h4>
        <p>
          Click OK to create a <code>{title}</code> page and start using the
          service.
        </p>
      </Alert>,
      root
    );
  }
};

// eslint-disable-next-line @typescript-eslint/ban-types
export type StageProps = PanelProps<object>;
export type StageContent = (props: StageProps) => React.ReactElement;
type GetStage = (setting?: string) => StageContent;
type StageConfig = {
  component: StageContent;
  check?: (tree: TreeNode[], service: string) => boolean;
  setting?: string;
  isMain?: boolean;
};

const ServiceContext = React.createContext<{
  pageUid: string;
  getStage: GetStage;
  service: string;
  settings: string[];
  metadata: Record<string, unknown>;
}>({
  pageUid: "UNSET-UID",
  getStage: () => () => <div />,
  service: "service",
  settings: [],
  metadata: {},
});

const useService = (): string => useContext(ServiceContext).service;
export const usePageUid = (): string => useContext(ServiceContext).pageUid;
export const useSetMetadata = (k: string): ((v: unknown) => void) => {
  const { metadata } = useContext(ServiceContext);
  return (v: unknown): void => {
    metadata[k] = v;
  };
};
export const useGetMetadata = (k: string): unknown =>
  useContext(ServiceContext).metadata[k];

export const useNextStage = (
  // eslint-disable-next-line @typescript-eslint/ban-types
  openPanel: (panel: Panel<object>) => void
): (() => void) => {
  const getStage = useContext(ServiceContext).getStage;
  return useCallback(
    () =>
      setTimeout(
        () =>
          openPanel({
            renderPanel: getStage(),
          }),
        1
      ),
    [getStage, openPanel]
  );
};

export const NextButton = ({
  disabled = false,
  onClick,
}: {
  disabled?: boolean;
  onClick: () => void;
}): React.ReactElement => (
  <Button
    onClick={onClick}
    intent={Intent.PRIMARY}
    disabled={disabled}
    style={{ maxWidth: 240 }}
  >
    NEXT
  </Button>
);

const RequestTokenContent: StageContent = ({ openPanel }) => {
  const nextStage = useNextStage(openPanel);
  const pageUid = usePageUid();
  const service = useService();
  const [value, setValue] = useState(getToken(service));
  const [useLocal, setUseLocal] = useState(
    !!localStorageGet(`token-${service}`)
  );
  const onChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value),
    [setValue]
  );
  const onSubmit = useCallback(() => {
    if (useLocal) {
      localStorageSet(`token-${service}`, value);
      setInputSetting({ blockUid: pageUid, key: "token", value: "" });
    } else {
      localStorageRemove(`token-${service}`);
      setInputSetting({ blockUid: pageUid, key: "token", value });
    }
    nextStage();
  }, [value, nextStage, pageUid, useLocal]);
  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (
        e.key === "Enter" &&
        !e.shiftKey &&
        !e.altKey &&
        !e.metaKey &&
        !e.ctrlKey &&
        value
      ) {
        onSubmit();
      }
    },
    [onSubmit]
  );
  return (
    <>
      <Label>
        RoamJS {toTitle(service)} Token
        <InputGroup value={value} onChange={onChange} onKeyDown={onKeyDown} />
      </Label>
      <Checkbox
        label={"Store Locally"}
        checked={useLocal}
        onChange={(e) => setUseLocal((e.target as HTMLInputElement).checked)}
      />
      <NextButton onClick={onSubmit} disabled={!value} />
    </>
  );
};

const SettingsContent: StageContent = ({ openPanel }) => {
  const { settings, getStage } = useContext(ServiceContext);
  return (
    <div>
      {settings.map((s) => (
        <div style={{ margin: 8 }} key={s}>
          <Button
            text={s}
            rightIcon={"arrow-right"}
            onClick={() =>
              openPanel({
                renderPanel: getStage(s),
              })
            }
            style={{
              minWidth: 180,
              display: "flex",
              justifyContent: "space-between",
            }}
          />
        </div>
      ))}
    </div>
  );
};

export const TOKEN_STAGE = {
  check: (_: TreeNode[], service: string): boolean => !!getToken(service),
  component: RequestTokenContent,
  setting: "Token",
} as const;

export const MainStage = (Content: StageContent): StageConfig => ({
  isMain: true,
  component: ((props) => (
    <>
      <Content {...props} />
      <Button
        minimal
        icon={"wrench"}
        onClick={() =>
          props.openPanel({
            renderPanel: SettingsContent,
          })
        }
        style={{ position: "absolute", top: -40, right: 8 }}
      />
    </>
  )) as StageContent,
});

export const ServiceDashboard: React.FC<{
  service: string;
  stages: StageConfig[];
}> = ({ service, stages }) => {
  const title = `roam/js/${service}`;
  const pageUid = useMemo(() => getPageUidByPageTitle(title), [title]);
  const mainIndex = useMemo(() => stages.findIndex((s) => s.isMain), [stages]);
  const [progress, setProgress] = useState(0);
  const [showProgress, setShowProgress] = useState(false);
  const getStage = useCallback(
    (setting?: string) => {
      if (setting) {
        const stage = stages.find((s) => s.setting === setting);
        if (stage) {
          return stage.component;
        }
      }
      const tree = getTreeByPageName(title);
      const index = stages.findIndex((s) =>
        s.check
          ? !s.check(tree, service)
          : s.isMain || !isFieldInTree(s.setting)(tree)
      );
      setProgress(index / mainIndex);
      if (index < mainIndex) {
        setShowProgress(true);
      }
      return stages.slice(index)[0].component;
    },
    [title, stages, setProgress, setShowProgress, service]
  );
  const settings = useMemo(
    () =>
      stages
        .map((s) => s.setting)
        .filter((s) => !!s)
        .map((s) => s as string),
    [stages]
  );
  const renderPanel = useMemo(getStage, [getStage]);
  useEffect(() => {
    if (progress === 1) {
      setTimeout(() => setShowProgress(false), 3000);
    }
  }, [progress, setShowProgress]);
  const [hideBlocks, setHideBlocks] = useState(true);
  const showBlocks = useCallback(() => setHideBlocks(false), [setHideBlocks]);
  return (
    <>
      <Card>
        <h4 style={{ padding: 4 }}>{toTitle(service)} Dashboard</h4>
        <ServiceContext.Provider
          value={{ getStage, pageUid, service, settings, metadata: {} }}
        >
          <style>
            {`.roamjs-service-panel {
    position: relative;
    overflow-x: hidden;
    overflow: visible;
    min-height: 320px;
  }
  
  .bp3-panel-stack-view {
    border: 0px;
    padding: 4px;
    overflow-y: visible;
    position: static;
  }
  
  .bp3-panel-stack-header {
    box-shadow: none;
    position: absolute;
    top: -64px;
  }
  
  button.bp3-button.bp3-panel-stack-header-back {
    margin-left: 0;
  }`}
          </style>
          <PanelStack2
            initialPanel={{
              renderPanel,
            }}
            className={"roamjs-service-panel"}
          />
          {showProgress && (
            <ProgressBar
              value={progress}
              animate={false}
              intent={Intent.PRIMARY}
            />
          )}
        </ServiceContext.Provider>
      </Card>
      {hideBlocks && (
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <h6>Roam outline with config data is hidden by default.</h6>
            <Button
              minimal
              icon={"small-cross"}
              onClick={showBlocks}
              id={"roamjs-service-hide-blocks"}
            />
          </div>
          <style>
            {`.roam-article .rm-block-children {
    visibility: hidden;
  }`}
          </style>
        </Card>
      )}
    </>
  );
};
