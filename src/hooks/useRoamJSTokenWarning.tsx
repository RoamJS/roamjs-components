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
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  createPage,
  getCurrentUserEmail,
  getPageUidByPageTitle,
  localStorageRemove,
  localStorageSet,
} from "roam-client";
import { createOverlayRender, setInputSetting } from "../hooks";
import { render as renderSimpleAlert } from "../SimpleAlert";
import { getToken } from "../util/getToken";

const TokenDialog = ({ onClose }: { onClose: () => void }) => {
  const pageUid = useMemo(
    () =>
      getPageUidByPageTitle("roam/js/roamjs") ||
      createPage({ title: "roam/js/roamjs", tree: [{ text: "token" }] }),
    []
  );
  const [token, setToken] = useState("");
  const [useLocal, setUseLocal] = useState(true);
  const onSubmit = useCallback(() => {
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
  }, [token, pageUid, useLocal]);
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
              r.data.exists ? "" : "sign up at https://roamjs.com/signup and "
            }add your RoamJS token to Roam to use this extension. You will only need to do this once per graph as this token will authorize you for all premium extensions.\n\nGrab your token from https://roamjs.com/user.`,
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
