import { InputGroup, Label } from "@blueprintjs/core";
import React from "react";
import idToTitle from "../../util/idToTitle";
import Description from "../Description";
import type { FieldPanel, TextField } from "./types";
import useSingleChildValue from "./useSingleChildValue";

const TextPanel: FieldPanel<TextField> = ({
  title,
  uid,
  parentUid,
  order,
  description,
  defaultValue = "",
}) => {
  const { value, onChange } = useSingleChildValue({
    defaultValue,
    title,
    uid,
    parentUid,
    order,
    transform: (s) => s,
    toStr: (s) => s,
  });
  return (
    <Label>
      {idToTitle(title)}
      <Description description={description} />
      <InputGroup
        value={value}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          onChange(e.target.value)
        }
      />
    </Label>
  );
};

TextPanel.type = "text";

export default TextPanel;
