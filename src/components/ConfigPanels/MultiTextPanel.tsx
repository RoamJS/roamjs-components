import { InputGroup } from "@blueprintjs/core";
import React from "react";
import MultiChildPanel from "./MultiChildPanel";
import type { FieldPanel, MultiTextField } from "./types";

const MultiTextPanel: FieldPanel<MultiTextField> = (props) => {
  return (
    <MultiChildPanel
      {...props}
      InputComponent={({ value, setValue }) => (
        <InputGroup
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={props.options?.placeholder}
        />
      )}
    />
  );
};

MultiTextPanel.type = "multitext";

export default MultiTextPanel;
