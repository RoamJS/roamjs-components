import { render as renderToast } from "../components/Toast";
import { render as renderAlert } from "../components/SimpleAlert";
import localStorageRemove from "./localStorageRemove";
import localStorageSet from "./localStorageSet";
import localStorageGet from "./localStorageGet";

const registerExperimentalMode = ({
  feature,
  onEnable,
  onDisable,
}: {
  feature?: string;
  onEnable: (isInitial: boolean) => void;
  onDisable: (isInitial: boolean) => void;
}) => {
  const label = feature
    ? `RoamJS Experiment: ${feature}`
    : "RoamJS Experimental Mode";
  const key = feature
    ? `experimental-${feature.toLowerCase().replace(/ /g, "-")}`
    : "experimental";
  const toggleExperimentalModeFeatures = (
    experimentalOverlayMode: boolean,
    isInitial: boolean
  ) => {
    if (experimentalOverlayMode) {
      onEnable(isInitial);
      window.roamAlphaAPI.ui.commandPalette.addCommand({
        label: `Disable ${label}`,
        callback: () => {
          localStorageRemove(key);
          toggleExperimentalModeFeatures(false, false);
          renderToast({
            id: "experimental",
            content: `Disabled ${label}`,
          });
        },
      });
      window.roamAlphaAPI.ui.commandPalette.removeCommand({
        label: `Enable ${label}`,
      });
    } else {
      onDisable(isInitial);
      window.roamAlphaAPI.ui.commandPalette.addCommand({
        label: `Enable ${label}`,
        callback: () => {
          renderAlert({
            content: `WARNING! Experimental features are not meant for public use for most users. Enabling has a higher likelihood of unintended consequences affecting your graph.

Are you sure you want to enable the experimental ${
              feature
                ? `RoamJS feature: ${feature}`
                : "features of RoamJS extensions"
            }?`,
            onConfirm: () => {
              localStorageSet(key, "true");
              toggleExperimentalModeFeatures(true, false);
              renderToast({
                id: "experimental",
                content: `Enabled ${label}`,
              });
            },
            onCancel: true,
          });
        },
      });
      window.roamAlphaAPI.ui.commandPalette.removeCommand({
        label: `Disable ${label}`,
      });
    }
  };
  toggleExperimentalModeFeatures(localStorageGet(key) === "true", true);
  return label;
};

export default registerExperimentalMode;
