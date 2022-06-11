import { Button, Label } from "@blueprintjs/core";
import React, { useState } from "react";
import getShallowTreeByParentUid from "../../queries/getShallowTreeByParentUid";
import idToTitle from "../../util/idToTitle";
import Description from "../Description";
import type { FieldPanel, ArrayField } from "./types";

const MultiChildPanel = ({
  uid: initialUid,
  title,
  description,
  order,
  parentUid,
  InputComponent,
}: Parameters<
  FieldPanel<
    ArrayField,
    {
      InputComponent: (props: {
        value: string;
        setValue: (s: string) => void;
      }) => React.ReactElement;
    }
  >
>[0]) => {
  const [uid, setUid] = useState(initialUid);
  const [texts, setTexts] = useState(() =>
    uid ? getShallowTreeByParentUid(uid) : []
  );
  const [value, setValue] = useState("");
  return (
    <>
      <Label>
        {idToTitle(title)}
        <Description description={description} />
        <div style={{ display: "flex" }}>
          <InputComponent value={value} setValue={setValue} />
          <Button
            icon={"plus"}
            minimal
            disabled={!value}
            onClick={() => {
              const valueUid = window.roamAlphaAPI.util.generateUID();
              if (uid) {
                window.roamAlphaAPI.createBlock({
                  location: { "parent-uid": uid, order: texts.length },
                  block: { string: value, uid: valueUid },
                });
              } else {
                const newUid = window.roamAlphaAPI.util.generateUID();
                window.roamAlphaAPI.createBlock({
                  block: { string: title, uid: newUid },
                  location: { order, "parent-uid": parentUid },
                });
                setTimeout(() => setUid(newUid));
                window.roamAlphaAPI.createBlock({
                  block: { string: value, uid: valueUid },
                  location: { order: 0, "parent-uid": newUid },
                });
              }
              setTexts([...texts, { text: value, uid: valueUid }]);
              setValue("");
            }}
          />
        </div>
      </Label>
      {texts.map((p) => (
        <div
          key={p.uid}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span
            style={{
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              overflow: "hidden",
            }}
          >
            {p.text}
          </span>
          <Button
            icon={"trash"}
            minimal
            onClick={() => {
              window.roamAlphaAPI.deleteBlock({ block: { uid: p.uid } });
              setTexts(texts.filter((f) => f.uid !== p.uid));
            }}
          />
        </div>
      ))}
    </>
  );
};

export default MultiChildPanel;
