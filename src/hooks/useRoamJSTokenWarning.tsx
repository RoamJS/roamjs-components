import axios from "axios";
import { useEffect,  } from "react";
import { render as renderSimpleAlert } from "../components/SimpleAlert";
import getToken from "../util/getToken";
import getCurrentUserEmail from "../queries/getCurrentUserEmail";
import { addTokenDialogCommand, render as renderTokenDialog } from "../components/TokenDialog";

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
    addTokenDialogCommand();
  }, []);
};

export default useRoamJSTokenWarning;
