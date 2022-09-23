import { Button } from "@blueprintjs/core";
import React, { useState } from "react";
import localStorageGet from "roamjs-components/util/localStorageGet";
import { localStorageSet } from "roamjs-components/util/localStorageSet";
import ExternalLogin, {
  ExternalLoginOptions,
} from "roamjs-components/components/ExternalLogin";

const OauthPanel = (options: ExternalLoginOptions) => {
  const key = `oauth-${options.service}`;
  const [accounts, setAccounts] = useState<
    { text: string; uid: string; data: string }[]
  >(() => JSON.parse(localStorageGet(key) as string));
  return (
    <>
      <ExternalLogin
        useLocal
        onSuccess={(acc) => setAccounts([...accounts, acc])}
        parentUid={""}
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
                    const accts = JSON.parse(
                      localStorageGet(key) as string
                    ) as {
                      uid: string;
                    }[];
                    localStorageSet(
                      key,
                      JSON.stringify(accts.filter((a) => act.uid !== a.uid))
                    );
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
