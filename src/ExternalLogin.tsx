import { Button, Icon, Spinner } from "@blueprintjs/core";
import React, { useState, useCallback } from "react";
import {
  createBlock,
  getTreeByBlockUid,
  localStorageGet,
  localStorageSet,
} from "roam-client";
import { restOp, toTitle } from "./hooks";

export type ExternalLoginOptions = {
  service: string;
  getPopoutUrl: () => Promise<string>;
  getAuthData: (d: string) => Promise<Record<string, string>>;
  ServiceIcon: React.FunctionComponent<React.SVGAttributes<SVGElement>>;
};

const targetOrigin = process.env.CUSTOM_ROAMJS_ORIGIN || "https://roamjs.com";

const ExternalLogin = ({
  onSuccess,
  useLocal,
  parentUid,
  service,
  getPopoutUrl,
  getAuthData,
  ServiceIcon,
}: {
  onSuccess: (block: { text: string; uid: string; data: string }) => void;
  parentUid: string;
  useLocal?: boolean;
} & ExternalLoginOptions): React.ReactElement => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const onClick = useCallback(() => {
    setLoading(true);
    getPopoutUrl()
      .then((url) => {
        const width = 600;
        const height = 525;
        const left = window.screenX + (window.innerWidth - width) / 2;
        const top = window.screenY + (window.innerHeight - height) / 2;
        const loginWindow = window.open(
          url,
          `roamjs:${service}:login`,
          `left=${left},top=${top},width=${width},height=${height},status=1`
        );
        const messageEventListener = (e: MessageEvent) => {
          if (e.origin === targetOrigin && loginWindow) {
            loginWindow.close();
            getAuthData(e.data)
              .then((rr) => {
                const labelUid = window.roamAlphaAPI.util.generateUID();
                const label = rr.label || "Default Account";
                const oauthData = JSON.stringify(restOp(rr, ["label"]));
                const account = {
                  text: label,
                  uid: labelUid,
                  data: oauthData,
                  time: new Date().valueOf(),
                };

                const existingTree = getTreeByBlockUid(
                  parentUid
                ).children.find((t) => /oauth/i.test(t.text));
                const blockUid =
                  existingTree?.uid ||
                  createBlock({ node: { text: "oauth" }, parentUid });
                if (useLocal) {
                  const key = `oauth-${service}`;
                  const accounts = JSON.parse(localStorageGet(key) as string);
                  localStorageSet(key, JSON.stringify([...accounts, account]));
                } else {
                  window.roamAlphaAPI.createBlock({
                    block: { string: label, uid: labelUid },
                    location: {
                      "parent-uid": blockUid,
                      order: existingTree?.children?.length || 0,
                    },
                  });

                  const valueUid = window.roamAlphaAPI.util.generateUID();
                  const block = {
                    string: oauthData,
                    uid: valueUid,
                  };
                  window.roamAlphaAPI.createBlock({
                    location: { "parent-uid": labelUid, order: 0 },
                    block,
                  });
                  window.roamAlphaAPI.updateBlock({
                    block: { open: false, string: "oauth", uid: blockUid },
                  });
                }
                onSuccess(account);
              })
              .finally(() =>
                window.removeEventListener("message", messageEventListener)
              );
          }
        };
        window.addEventListener("message", messageEventListener);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [onSuccess, parentUid, setLoading, setError]);
  return (
    <>
      <Button
        icon={
          <Icon
            icon={
              <ServiceIcon
                style={{
                  width: 15,
                  height: 15,
                  marginLeft: 4,
                  cursor: "pointer",
                }}
              />
            }
          />
        }
        onClick={onClick}
        disabled={loading}
      >
        Login With {toTitle(service)}
      </Button>
      {loading && <Spinner size={Spinner.SIZE_SMALL} />}
      {error && (
        <div style={{ color: "red", whiteSpace: "pre-line" }}>{error}</div>
      )}
    </>
  );
};

export default ExternalLogin;
