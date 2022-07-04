import {
  InputGroup,
  Menu,
  MenuItem,
  PopoverPosition,
  Popover,
  Button,
  TextArea,
} from "@blueprintjs/core";
import React, {
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect,
} from "react";
import useArrowKeyDown from "../hooks/useArrowKeyDown";
import fuzzy from "fuzzy";

export type AutocompleteInputProps = {
  value: string;
  setValue: (q: string) => void;
  showButton?: boolean;
  onBlur?: (v: string) => void;
  onConfirm?: () => void;
  options?: string[];
  placeholder?: string;
  autoFocus?: boolean;
  multiline?: boolean;
};

const AutocompleteInput = ({
  value,
  setValue,
  onBlur,
  onConfirm,
  showButton,
  options = [],
  placeholder = "Enter value",
  autoFocus,
  multiline,
}: AutocompleteInputProps): React.ReactElement => {
  const [isOpen, setIsOpen] = useState(false);
  const open = useCallback(() => setIsOpen(true), [setIsOpen]);
  const close = useCallback(() => setIsOpen(false), [setIsOpen]);
  const [isTyping, setIsTyping] = useState(false);
  const items = useMemo(
    () =>
      value
        ? fuzzy
            .filter(value, options)
            .slice(0, 9)
            .map((e) => e.string)
        : options.slice(0, 9),
    [value, options]
  );
  const menuRef = useRef<HTMLUListElement>(null);
  const inputRef = useRef<HTMLInputElement & HTMLTextAreaElement>(null);
  const onEnter = useCallback(
    (value) => {
      if (isOpen) {
        setValue(value);
        setIsTyping(false);
      } else if (onConfirm) {
        onConfirm();
      } else {
        setIsOpen(true);
      }
    },
    [setValue, close, onConfirm, isOpen]
  );
  const { activeIndex, onKeyDown } = useArrowKeyDown({
    onEnter,
    results: items,
    menuRef,
  });
  useEffect(() => {
    if (!items.length || !isTyping) close();
    else open();
  }, [items, close, open, isTyping]);
  const Input = useMemo(() => (multiline ? TextArea : InputGroup), [multiline]);
  return (
    <Popover
      portalClassName={"roamjs-autocomplete-input"}
      targetClassName={"roamjs-autocomplete-input-target"}
      captureDismiss={true}
      isOpen={isOpen}
      onOpened={open}
      minimal
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
              text={t}
              active={activeIndex === i}
              key={i}
              multiline
              onClick={() => {
                setIsTyping(false);
                setValue(t);
                inputRef.current?.focus();
              }}
            />
          ))}
        </Menu>
      }
      target={
        <Input
          value={value || ""}
          onChange={(e) => {
            setIsTyping(true);
            setValue(e.target.value);
          }}
          autoFocus={autoFocus}
          placeholder={placeholder}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              e.stopPropagation();
              close();
            } else {
              onKeyDown(e);
            }
          }}
          onClick={() => setIsTyping(true)}
          onBlur={(e) => {
            if (
              e.relatedTarget === null ||
              !(e.relatedTarget as HTMLElement).closest?.(
                ".roamjs-autocomplete-input"
              )
            ) {
              setIsTyping(false);
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

export default AutocompleteInput;
