import { Label } from "@blueprintjs/core";
import React, { useMemo } from "react";
import idToTitle from "../../util/idToTitle";
import Description from "../Description";
import MenuItemSelect from "../MenuItemSelect";
import type { FieldPanel, SelectField } from "./types";
import useSingleChildValue from "./useSingleChildValue";

const SelectPanel: FieldPanel<SelectField> = ({
  title,
  uid,
  parentUid,
  order,
  description,
  defaultValue = "",
  options: { items },
}) => {
  const optionItems = useMemo(
    () => (typeof items === "function" ? items() : items),
    [items]
  );
  const { value, onChange } = useSingleChildValue({
    defaultValue: defaultValue || optionItems[0],
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
      <MenuItemSelect
        activeItem={value}
        onItemSelect={(e) => onChange(e)}
        items={optionItems}
      />
    </Label>
  );
};

SelectPanel.type = "select";

export default SelectPanel;
