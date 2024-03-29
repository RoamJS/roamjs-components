import {
  Popover,
  PopoverPosition,
  Menu,
  MenuItem,
  InputGroup,
} from "@blueprintjs/core";
import React, { useCallback, useMemo, useRef, useState } from "react";
import getAllBlockUidsAndTexts from "../queries/getAllBlockUidsAndTexts";
import useArrowKeyDown from "../hooks/useArrowKeyDown";

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
  getAllBlocks = getAllBlockUidsAndTexts,
  autoFocus,
}: {
  value: string;
  setValue: (q: string, uid?: string) => void;
  onBlur?: (v: string) => void;
  onConfirm?: () => void;
  getAllBlocks?: () => { text: string; uid: string }[];
  autoFocus?: boolean;
}): React.ReactElement => {
  const [isOpen, setIsOpen] = useState(false);
  const open = useCallback(() => setIsOpen(true), [setIsOpen]);
  const close = useCallback(() => setIsOpen(false), [setIsOpen]);
  const allBlocks = useMemo(getAllBlocks, []);
  const items = useMemo(
    () => (value && isOpen ? searchBlocksByString(value, allBlocks) : []),
    [value, allBlocks]
  );
  const menuRef = useRef<HTMLUListElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { activeIndex, onKeyDown } = useArrowKeyDown({
    onEnter: (value) => {
      if (isOpen) {
        setValue(value.text, value.uid);
        close();
      } else if (onConfirm) {
        onConfirm();
      }
    },
    results: items,
    menuRef,
  });
  return (
    <Popover
      portalClassName={"roamjs-block-input"}
      targetClassName={"roamjs-block-input-target"}
      captureDismiss={true}
      isOpen={isOpen}
      onOpened={open}
      minimal={true}
      autoFocus={false}
      enforceFocus={false}
      position={PopoverPosition.BOTTOM_LEFT}
      modifiers={{
        flip: { enabled: false },
        preventOverflow: { enabled: false },
      }}
      content={
        <Menu className={"max-h-64 overflow-auto max-w-md"} ulRef={menuRef}>
          {items.map((t, i) => (
            <MenuItem
              text={t.text}
              active={activeIndex === i}
              key={t.uid}
              multiline
              onClick={() => {
                setValue(t.text, t.uid);
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
          placeholder={"Search for a block"}
          onKeyDown={onKeyDown}
          onBlur={(e) => {
            if (
              e.relatedTarget &&
              !(e.relatedTarget as HTMLElement).closest?.(".roamjs-block-input")
            ) {
              close();
            }
            if (onBlur) {
              onBlur(e.target.value);
            }
          }}
          inputRef={inputRef}
          autoFocus={autoFocus}
        />
      }
    />
  );
};

export default BlockInput;
