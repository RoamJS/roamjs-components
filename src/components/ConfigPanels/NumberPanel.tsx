import { Label, NumericInput } from "@blueprintjs/core";
import React from "react";
import idToTitle from "../../util/idToTitle";
import Description from "../Description";
import { FieldPanel, NumberField } from "./types";
import useSingleChildValue from "./useSingleChildValue";

const NumberPanel: FieldPanel<NumberField> = ({
  title,
  uid,
  parentUid,
  order,
  description,
  defaultValue = 0,
}) => {
  const { value, onChange } = useSingleChildValue({
    defaultValue,
    title,
    uid,
    parentUid,
    order,
    transform: parseInt,
    toStr: (v) => `${v}`,
  });
  return (
    <Label>
      {idToTitle(title)}
      <Description description={description} />
      <NumericInput value={value} onValueChange={onChange} />
    </Label>
  );
};

NumberPanel.type = "number";

export default NumberPanel;
