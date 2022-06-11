import { Label } from "@blueprintjs/core";
import { TimePicker } from "@blueprintjs/datetime";
import format from "date-fns/format";
import startOfDay from "date-fns/startOfDay";
import React from "react";
import idToTitle from "../../util/idToTitle";
import Description from "../Description";
import type { FieldPanel, TimeField } from "./types";
import useSingleChildValue from "./useSingleChildValue";

const TimePanel: FieldPanel<TimeField> = ({
  title,
  uid,
  parentUid,
  order,
  description,
  defaultValue = startOfDay(new Date()),
}) => {
  const { value, onChange } = useSingleChildValue({
    defaultValue,
    title,
    uid,
    parentUid,
    order,
    transform: (s) => {
      const d = new Date();
      const [hours, minutes] = s.split(":");
      d.setHours(Number(hours));
      d.setMinutes(Number(minutes));
      return d;
    },
    toStr: (v) => format(v, "HH:mm"),
  });
  return (
    <Label>
      {idToTitle(title)}
      <Description description={description} />
      <TimePicker value={value} onChange={onChange} showArrowButtons />
    </Label>
  );
};

TimePanel.type = "time";

export default TimePanel;
