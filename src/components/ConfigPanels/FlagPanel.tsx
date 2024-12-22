import { Checkbox } from "@blueprintjs/core";
import React, { useState } from "react";
import idToTitle from "../../util/idToTitle";
import Description from "../Description";
import type { FieldPanel, FlagField } from "./types";

const FlagPanel: FieldPanel<FlagField> = ({
  title,
  uid: initialUid,
  parentUid,
  order,
  description,
  options = {},
  disabled = false,
}) => {
  const [uid, setUid] = useState(initialUid);
  return (
    <Checkbox
      checked={!!uid}
      disabled={disabled}
      onChange={(e) => {
        const { checked } = e.target as HTMLInputElement;
        if (checked) {
          const newUid = window.roamAlphaAPI.util.generateUID();
          window.roamAlphaAPI.createBlock({
            block: { string: title, uid: newUid },
            location: { order, "parent-uid": parentUid },
          });
          setTimeout(() => setUid(newUid), 1);
        } else {
          window.roamAlphaAPI.deleteBlock({ block: { uid } });
          setUid("");
        }
        options.onChange?.(checked, e);
      }}
      labelElement={
        <>
          {idToTitle(title)}
          <Description description={description} />
        </>
      }
    />
  );
};

FlagPanel.type = "flag";

export default FlagPanel;
