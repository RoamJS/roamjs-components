import {
  Popover,
  PopoverPosition,
  Menu,
  MenuItem,
  InputGroup,
  Button,
} from "@blueprintjs/core";
import React, { useCallback, useMemo, useRef, useState } from "react";
import { getAllPageNames } from "roam-client";
import { useArrowKeyDown } from "./hooks";
import fuzzy from "fuzzy";

const DEFAULT_EXTRA: string[] = [];

const PageInput = ({
  value,
  setValue,
  onBlur,
  onConfirm,
  showButton,
  extra = DEFAULT_EXTRA,
}: {
  value: string;
  setValue: (q: string) => void;
  showButton?: boolean;
  onBlur?: (v: string) => void;
  onConfirm?: () => void;
  extra?: string[];
}): React.ReactElement => {
  const [isOpen, setIsOpen] = useState(false);
  const open = useCallback(() => setIsOpen(true), [setIsOpen]);
  const close = useCallback(() => setIsOpen(false), [setIsOpen]);
  const allPages = useMemo(() => [...getAllPageNames(), ...extra], [extra]);
  const items = useMemo(
    () =>
      value && isOpen
        ? fuzzy
            .filter(value, allPages)
            .slice(0, 9)
            .map((e) => e.string)
        : [],
    [value, allPages]
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
      portalClassName={"roamjs-page-input"}
      targetClassName={"roamjs-page-input-target"}
      captureDismiss={true}
      isOpen={isOpen}
      onOpened={open}
      minimal={true}
      position={PopoverPosition.BOTTOM_LEFT}
      content={
        <Menu style={{ maxWidth: 400 }}>
          {items.map((t, i) => (
            <MenuItem
              text={t}
              active={activeIndex === i}
              key={i}
              multiline
              onClick={() => {
                setValue(items[i]);
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
          {...(showButton
            ? {
                rightElement: <Button icon={"add"} minimal onClick={onEnter} />,
              }
            : {})}
        />
      }
    />
  );
};

export default PageInput;
