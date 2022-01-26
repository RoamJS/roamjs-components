import {
  Button,
  Checkbox,
  Classes,
  Dialog,
  InputGroup,
  Intent,
  Label,
} from "@blueprintjs/core";
import axios from "axios";
import React, { useCallback, useEffect, useState } from "react";
import createOverlayRender from "../util/createOverlayRender";
import setInputSetting from "../util/setInputSetting";
import { render as renderSimpleAlert } from "../components/SimpleAlert";
import getToken from "../util/getToken";
import { getPageUidByPageTitle, getCurrentUserEmail } from "../queries";
import localStorageRemove from "../util/localStorageRemove";
import localStorageSet from "../util/localStorageSet";
import { createPage } from "../writes";

const TokenDialog = ({ onClose }: { onClose: () => void }) => {
  const [token, setToken] = useState(getToken);
  const [useLocal, setUseLocal] = useState(true);
  const onSubmit = useCallback(() => {
    const pageUid = getPageUidByPageTitle("roam/js/roamjs");
    return (
      pageUid
        ? Promise.resolve(pageUid)
        : createPage({ title: "roam/js/roamjs", tree: [{ text: "token" }] })
    ).then(() => {
      if (useLocal) {
        localStorageSet(`token`, token);
        setInputSetting({
          blockUid: pageUid,
          key: "token",
          value: "",
        });
      } else {
        localStorageRemove(`token`);
        setInputSetting({
          blockUid: pageUid,
          key: "token",
          value: token,
        });
      }
      onClose();
    });
  }, [token, useLocal, onClose]);
  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (
        e.key === "Enter" &&
        !e.shiftKey &&
        !e.altKey &&
        !e.metaKey &&
        !e.ctrlKey &&
        token
      ) {
        onSubmit();
      }
    },
    [onSubmit, token]
  );
  return (
    <>
      <Dialog
        isOpen={true}
        title={`Add RoamJS Token`}
        onClose={onClose}
        isCloseButtonShown
        canOutsideClickClose
        canEscapeKeyClose
      >
        <div
          className={Classes.DIALOG_BODY}
          onKeyDown={(e) => e.stopPropagation()}
        >
          <Label>
            RoamJS Token
            <InputGroup
              value={token}
              onChange={(e) => setToken(e.target.value)}
              onKeyDown={onKeyDown}
              type="password"
            />
          </Label>
          <Checkbox
            label={"Store Locally"}
            checked={useLocal}
            onChange={(e) =>
              setUseLocal((e.target as HTMLInputElement).checked)
            }
          />
        </div>
        <div className={Classes.DIALOG_FOOTER}>
          <div className={Classes.DIALOG_FOOTER_ACTIONS}>
            <Button text={"Cancel"} onClick={onClose} />
            <Button text={"Save"} intent={Intent.PRIMARY} onClick={onSubmit} />
          </div>
        </div>
      </Dialog>
    </>
  );
};

const renderTokenDialog = createOverlayRender("token-dialog", TokenDialog);

const useRoamJSTokenWarning = (): void => {
  useEffect(() => {
    const token = getToken();
    if (!token) {
      axios
        .post(`https://lambda.roamjs.com/users`, {
          email: getCurrentUserEmail(),
        })
        .then((r) => {
          renderSimpleAlert({
            content: `You need to ${
              r.data.exists
                ? ""
                : "sign up at [https://roamjs.com/signup](https://roamjs.com/signup) and "
            }add your RoamJS token to Roam to use this extension. You will only need to do this once per graph as this token will authorize you for all premium extensions.\n\nGrab your token from [https://roamjs.com/user/#Extensions](https://roamjs.com/user/#Extensions).`,
            onConfirm: () => renderTokenDialog({}),
            canCancel: true,
          });
        });
    }
    window.roamAlphaAPI.ui.commandPalette.addCommand({
      label: "Set RoamJS Token",
      callback: () => renderTokenDialog({}),
    });
  }, []);
};

export default useRoamJSTokenWarning;
