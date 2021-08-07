import {
  Popover,
  PopoverPosition,
  Menu,
  MenuItem,
  InputGroup,
} from "@blueprintjs/core";
import React, { useCallback, useMemo, useRef, useState } from "react";
import { getAllBlockUidsAndTexts } from "roam-client";
import { useArrowKeyDown } from "./hooks";

const searchBlocksByString = (
  q: string,
  blocks: { text: string; uid: string }[]
) => {
  const regex = new RegExp(q, "i");
  return blocks.filter((a) => regex.test(a.text)).slice(0, 9);
};

const BlockInput = ({
  value,
  setValue,
  onBlur,
  onConfirm,
}: {
  value: string;
  setValue: (q: string) => void;
  onBlur?: (v: string) => void;
  onConfirm?: () => void;
}): React.ReactElement => {
  const [isOpen, setIsOpen] = useState(false);
  const open = useCallback(() => setIsOpen(true), [setIsOpen]);
  const close = useCallback(() => setIsOpen(false), [setIsOpen]);
  const allBlocks = useMemo(getAllBlockUidsAndTexts, []);
  const items = useMemo(
    () => (value && isOpen ? searchBlocksByString(value, allBlocks) : []),
    [value, allBlocks]
  );
  const inputRef = useRef<HTMLInputElement>(null);
  const onEnter = useCallback(
    (value) => {
      if (isOpen) {
        setValue(value);
        close();
      } else if (onConfirm) {
        onConfirm();
      }
    },
    [setValue, close, onConfirm, isOpen]
  );
  const { activeIndex, onKeyDown } = useArrowKeyDown({
    onEnter,
    results: items,
  });
  return (
    <Popover
      portalClassName={"roamjs-block-input"}
      targetClassName={"roamjs-block-input-target"}
      captureDismiss={true}
      isOpen={isOpen}
      onOpened={open}
      minimal={true}
      position={PopoverPosition.BOTTOM_LEFT}
      content={
        <Menu style={{ maxWidth: 400 }}>
          {items.map((t, i) => (
            <MenuItem
              text={t.uid}
              active={activeIndex === i}
              key={i}
              multiline
              onClick={() => {
                setValue(items[i].text);
                close();
                inputRef.current?.focus();
              }}
            />
          ))}
        </Menu>
      }
      target={
        <InputGroup
          value={value || ""}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setValue(e.target.value);
            setIsOpen(!!e.target.value);
          }}
          placeholder={"Search for a page"}
          autoFocus={true}
          onKeyDown={onKeyDown}
          onBlur={(e) => {
            if (e.relatedTarget) {
              close();
            }
            if (onBlur) {
              onBlur(e.target.value);
            }
          }}
          inputRef={inputRef}
        />
      }
    />
  );
};

export default BlockInput;
