import React from "react";
import PageInput from "../PageInput";
import MultiChildPanel from "./MultiChildPanel";
import type { FieldPanel, PagesField } from "./types";

const PagesPanel: FieldPanel<PagesField> = (props) => {
  return (
    <MultiChildPanel
      {...props}
      InputComponent={(inputProps) => (
        <PageInput extra={["{all}"]} {...inputProps} />
      )}
    />
  );
};

PagesPanel.type = "pages";

export default PagesPanel;
