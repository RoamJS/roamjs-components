import {
  Button,
  Checkbox,
  Classes,
  Dialog,
  InputGroup,
  Intent,
  Label,
} from "@blueprintjs/core";
import React, { useCallback, useState } from "react";
import createOverlayRender from "../util/createOverlayRender";
import setInputSetting from "../util/setInputSetting";
import getToken from "../util/getToken";
import getPageUidByPageTitle from "../queries/getPageUidByPageTitle";
import localStorageRemove from "../util/localStorageRemove";
import localStorageSet from "../util/localStorageSet";
import createPage from "../writes/createPage";
import { render as renderSimpleAlert } from "../components/SimpleAlert";
import getCurrentUserEmail from "../queries/getCurrentUserEmail";
import apiGet from "../util/apiGet";

type Props = { onEnter?: (token: string) => void };

const TokenDialog = ({ onClose, onEnter }: { onClose: () => void } & Props) => {
  const [token, setToken] = useState(getToken);
  const [useLocal, setUseLocal] = useState(true);
  const dialogOnClose = useCallback(() => {
    onClose();
    onEnter?.("");
  }, [onClose, onEnter]);
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
      onEnter?.(token);
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
        onClose={dialogOnClose}
        canOutsideClickClose
        canEscapeKeyClose
        autoFocus={false}
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
            <Button text={"Cancel"} onClick={dialogOnClose} />
            <Button text={"Save"} intent={Intent.PRIMARY} onClick={onSubmit} />
          </div>
        </div>
      </Dialog>
    </>
  );
};

export const render = createOverlayRender<Props>("token-dialog", TokenDialog);

export const addTokenDialogCommand = (props: Props = {}) =>
  window.roamAlphaAPI.ui.commandPalette.addCommand({
    label: "Set RoamJS Token",
    callback: () => render(props),
  });

export const checkRoamJSTokenWarning = () => {
  const token = getToken();
  if (!token) {
    return new Promise<string>((resolve) =>
      apiGet<{ exists: boolean }>({
        path: `users?email=${encodeURIComponent(getCurrentUserEmail())}`,
        anonymous: true,
      }).then((r) => {
        return renderSimpleAlert({
          content: `You need to ${
            r.exists
              ? ""
              : "sign up at [https://roamjs.com/signup](https://roamjs.com/signup) and "
          }add your RoamJS token to Roam to use this extension. You will only need to do this once per graph as this token will authorize you for all premium extensions.\n\nGrab your token from [https://roamjs.com/user/#Extensions](https://roamjs.com/user/#Extensions).`,
          onConfirm: () => render({ onEnter: resolve }),
          onCancel: () => resolve(""),
          externalLink: true,
        });
      })
    );
  } else {
    return Promise.resolve(token);
  }
};

export default TokenDialog;
