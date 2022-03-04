import { useEffect } from "react";
import {
  addTokenDialogCommand,
  checkRoamJSTokenWarning,
} from "../components/TokenDialog";

const useRoamJSTokenWarning = (): void => {
  useEffect(() => {
    checkRoamJSTokenWarning();
    addTokenDialogCommand();
  }, []);
};

export default useRoamJSTokenWarning;
