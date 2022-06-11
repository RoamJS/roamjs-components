import { Label } from "@blueprintjs/core";
import React, { useMemo } from "react";
import idToTitle from "../../util/idToTitle";
import createBlock from "../../writes/createBlock";
import Description from "../Description";
import type { FieldPanel, CustomField } from "./types";

const CustomPanel: FieldPanel<CustomField> = ({
  description,
  title,
  uid: inputUid,
  options: { component: Component },
  parentUid,
  defaultValue = [],
  order,
}) => {
  const uid = useMemo(() => {
    if (inputUid) return inputUid;
    const newUid = window.roamAlphaAPI.util.generateUID();
    createBlock({ node: { text: title, uid: newUid }, parentUid, order });
    return newUid;
  }, [inputUid]);
  return (
    <>
      <Label>
        {idToTitle(title)}
        <Description description={description} />
      </Label>
      <Component
        uid={uid}
        parentUid={parentUid}
        title={title}
        defaultValue={defaultValue}
      />
    </>
  );
};

CustomPanel.type = "custom";

export default CustomPanel;
