import { render as renderToast } from "../components/Toast";
import { render as renderAlert } from "../components/SimpleAlert";
import localStorageRemove from "./localStorageRemove";
import localStorageSet from "./localStorageSet";
import localStorageGet from "./localStorageGet";

const registerExperimentalMode = ({
  onEnable,
  onDisable,
}: {
  onEnable: () => void;
  onDisable: () => void;
}) => {
  const toggleExperimentalModeFeatures = (experimentalOverlayMode: boolean) => {
    if (experimentalOverlayMode) {
      onEnable();
      window.roamAlphaAPI.ui.commandPalette.addCommand({
        label: "Disable RoamJS Experimental Mode",
        callback: () => {
          localStorageRemove("experimental");
          toggleExperimentalModeFeatures(false);
          renderToast({
            id: "experimental",
            content: `Disabled RoamJS Experimental Mode`,
          });
        },
      });
      window.roamAlphaAPI.ui.commandPalette.removeCommand({
        label: "Enable RoamJS Experimental Mode",
      });
    } else {
      onDisable();
      window.roamAlphaAPI.ui.commandPalette.addCommand({
        label: "Enable RoamJS Experimental Mode",
        callback: () => {
          renderAlert({
            content:
              "WARNING! Experimental features are not meant for public use for most users. Enabling has a higher likelihood of unintended consequences affecting your graph.\n\nAre you sure you want to enable the experimental features of RoamJS extensions?",
            onConfirm: () => {
              localStorageSet("experimental", "true");
              toggleExperimentalModeFeatures(true);
              renderToast({
                id: "experimental",
                content: `Enabled RoamJS Experimental Mode`,
              });
            },
          });
        },
      });
      window.roamAlphaAPI.ui.commandPalette.removeCommand({
        label: "Disable RoamJS Experimental Mode",
      });
    }
  };
  toggleExperimentalModeFeatures(localStorageGet("experimental") === "true");
};

export default registerExperimentalMode;
