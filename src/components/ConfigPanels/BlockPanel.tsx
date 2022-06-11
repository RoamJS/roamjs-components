import { Label } from "@blueprintjs/core";
import React, { useRef, useEffect } from "react";
import getFirstChildUidByBlockUid from "../../queries/getFirstChildUidByBlockUid";
import idToTitle from "../../util/idToTitle";
import createBlock from "../../writes/createBlock";
import Description from "../Description";
import type { FieldPanel, BlockField } from "./types";

const BlockPanel: FieldPanel<BlockField> = ({
  uid: initialUid,
  parentUid,
  title,
  defaultValue,
  description,
}) => {
  const containerRef = useRef(null);
  useEffect(() => {
    if (containerRef.current) {
      const el = containerRef.current;
      (initialUid
        ? Promise.resolve(initialUid)
        : createBlock({ node: { text: title, children: [] }, parentUid })
      )
        .then(
          (formatUid) =>
            getFirstChildUidByBlockUid(formatUid) ||
            createBlock({
              node: defaultValue || { text: " " },
              parentUid: formatUid,
            })
        )
        .then((uid) => {
          window.roamAlphaAPI.ui.components.renderBlock({
            uid,
            el,
          });
        });
    }
  }, [containerRef, defaultValue]);
  return (
    <>
      <Label>
        {idToTitle(title)}
        <Description description={description} />
      </Label>
      <div
        ref={containerRef}
        style={{
          border: "1px solid #33333333",
          padding: "8px 0",
          borderRadius: 4,
        }}
      ></div>
    </>
  );
};

BlockPanel.type = "block";

export default BlockPanel;
