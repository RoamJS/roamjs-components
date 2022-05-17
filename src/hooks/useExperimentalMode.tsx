import { useCallback, useState } from "react";
import localStorageGet from "../util/localStorageGet";
import localStorageRemove from "../util/localStorageRemove";
import localStorageSet from "../util/localStorageSet";

const useExperimentalMode = () => {
  const [experimentalMode, setExperimentalMode] = useState(
    !!localStorageGet("experimental")
  );
  const listener = useCallback(
    (e) => {
      if (
        e.ctrlKey &&
        e.metaKey &&
        e.shiftKey &&
        e.altKey &&
        (e.key === "M" || e.key === "KeyM")
      ) {
        const newVal = !localStorageGet("experimental");
        setExperimentalMode(newVal);
        if (newVal) localStorageSet("experimental", "true");
        else localStorageRemove("experimental");
        e.preventDefault();
        e.stopPropagation();
      }
    },
    [setExperimentalMode]
  );
  return { experimentalMode, listener };
};

export default useExperimentalMode;
