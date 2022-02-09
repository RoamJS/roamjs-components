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
import { getPageUidByPageTitle } from "../queries";
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

export const render = createOverlayRender("token-dialog", TokenDialog);

export const addTokenDialogCommand = () =>
  window.roamAlphaAPI.ui.commandPalette.addCommand({
    label: "Set RoamJS Token",
    callback: () => render({}),
  });

export default TokenDialog;
