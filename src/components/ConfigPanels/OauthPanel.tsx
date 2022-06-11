import { Button, Checkbox } from "@blueprintjs/core";
import React, { useCallback, useState } from "react";
import getBasicTreeByParentUid from "../../queries/getBasicTreeByParentUid";
import getShallowTreeByParentUid from "../../queries/getShallowTreeByParentUid";
import localStorageGet from "../../util/localStorageGet";
import localStorageRemove from "../../util/localStorageRemove";
import { localStorageSet } from "../../util/localStorageSet";
import deleteBlock from "../../writes/deleteBlock";
import Description from "../Description";
import ExternalLogin from "../ExternalLogin";
import type { OauthField, FieldPanel } from "./types";

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

OauthPanel.type = "oauth";

export default OauthPanel;
