import { Button, Label, Tooltip } from "@blueprintjs/core";
import React, { useEffect, useRef, useState } from "react";
import getFirstChildUidByBlockUid from "../../queries/getFirstChildUidByBlockUid";
import idToTitle from "../../util/idToTitle";
import createBlock from "../../writes/createBlock";
import Description from "../Description";
import type { FieldPanel, BlocksField } from "./types";

const BlocksPanel: FieldPanel<BlocksField> = ({
  uid: initialUid,
  parentUid,
  title,
  defaultValue,
  description,
}) => {
  const containerRef = useRef(null);
  const [navUid, setNavUid] = useState(initialUid || parentUid);
  useEffect(() => {
    if (containerRef.current) {
      const el = containerRef.current;
      (initialUid
        ? Promise.resolve(initialUid)
        : createBlock({ node: { text: title, children: [] }, parentUid }).then(
            (uid) => {
              setNavUid(uid);
              return uid;
            }
          )
      )
        .then((formatUid) =>
          getFirstChildUidByBlockUid(formatUid).then((childUid) =>
            childUid
              ? formatUid
              : (defaultValue?.length
                  ? Promise.all(
                      defaultValue.map((node, order) =>
                        createBlock({
                          node,
                          parentUid: formatUid,
                          order,
                        })
                      )
                    )
                  : createBlock({
                      node: { text: " " },
                      parentUid: formatUid,
                    })
                ).then(() => formatUid)
          )
        )
        .then((uid) => {
          window.roamAlphaAPI.ui.components.renderBlock({
            uid,
            el,
          });
        });
    }
  }, [containerRef, defaultValue, setNavUid]);
  return (
    <>
      <Label>
        {idToTitle(title)}
        <Description description={description} />
        <Tooltip content={"Click here to edit these blocks directly"}>
          <Button
            icon={"link"}
            minimal
            onClick={() =>
              window.roamAlphaAPI.ui.mainWindow.openBlock({
                block: { uid: navUid },
              })
            }
          />
        </Tooltip>
      </Label>
      <style>{`.roamjs-config-blocks > div > .rm-block-main {
    display: none;
  }
  
  .roamjs-config-blocks > div > .rm-block-children > .rm-multibar {
    display: none;
  }
  
  .roamjs-config-blocks > div > .rm-block-children {
    margin-left: -4px;
  }`}</style>
      <div
        ref={containerRef}
        style={{
          border: "1px solid #33333333",
          padding: "8px 0",
          borderRadius: 4,
        }}
        className={"roamjs-config-blocks"}
      ></div>
    </>
  );
};

BlocksPanel.type = "blocks";

export default BlocksPanel;
