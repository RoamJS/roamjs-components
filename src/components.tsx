import ReactDOM from "react-dom";
import React, { useState, useMemo } from "react";

import AutocompleteInput from "./components/AutocompleteInput";
import PageInput from "./components/PageInput";
import runExtension from "./util/runExtension";

// const blockRender = (Component: React.FC) => {
//   const block = window.roamAlphaAPI.ui.getFocusedBlock();
//   const parent = document.getElementById(
//     `block-input-${block?.["window-id"]}-${block?.["block-uid"]}`
//   );
//   ReactDOM.render(<Component />, parent);
// };

const rootRender = (Component: React.FC) => {
  const parent = document.querySelector(".roam-article");
  ReactDOM.render(<Component />, parent);
};

const components = [
  {
    callback: () =>
      rootRender(() => {
        const [value, setValue] = useState("");
        const options = useMemo(() => ["apple", "banana", "orange"], []);
        return (
          <>
            <AutocompleteInput
              value={value}
              setValue={setValue}
              options={options}
            />
          </>
        );
      }),
    label: "AutocompleteInput",
  },
  {
    callback: () =>
      rootRender(() => {
        const [value, setValue] = useState("");
        const [multiline, setMultiline] = useState(false);
        return (
          <>
            <PageInput
              value={value}
              setValue={setValue}
              multiline={multiline}
            />
            <input
              className="ml-8 inline-block"
              checked={multiline}
              onChange={(e) => setMultiline(e.target.checked)}
              type={"checkbox"}
            />
          </>
        );
      }),
    label: "PageInput",
  },
];

export default runExtension({
  extensionId: "components",
  run: () => {
    components.forEach(({ callback, label }) => {
      window.roamAlphaAPI.ui.commandPalette.addCommand({
        label: `Render RoamJS component ${label}`,
        callback,
      });
    });
    return { commands: components.map((k) => k.label) };
  },
});
