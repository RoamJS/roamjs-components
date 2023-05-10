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

export type AutocompleteInputProps<T = string> = {
  value: T;
  setValue: (q: T) => void;
  showButton?: boolean;
  onBlur?: (v: string) => void;
  onConfirm?: () => void;
  options?: T[];
  placeholder?: string;
  autoFocus?: boolean;
  multiline?: boolean;
  id?: string;
  filterOptions?: (options: T[], query: string) => T[];
  itemToString?: (item: T) => string;
  renderItem?: (props: {
    item: T;
    onClick: () => void;
    active: boolean;
  }) => React.ReactElement;
  onNewItem?: (s: string) => T;
};

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-constraint
const AutocompleteInput = <T extends unknown = string>({
  value,
  setValue,
  onBlur,
  onConfirm,
  showButton,
  options = [],
  placeholder = "Enter value",
  autoFocus,
  multiline,
  id,
  filterOptions = (o, q) =>
    typeof o[0] === "string"
      ? (fuzzy.filter(q, o).map((e) => e.string) as T[])
      : o,
  itemToString = (i) => `${i}`,
  renderItem,
  onNewItem = (s) => s as T,
}: AutocompleteInputProps<T>): React.ReactElement => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState<string>(() => itemToString(value));
  const open = useCallback(() => setIsOpen(true), [setIsOpen]);
  const close = useCallback(() => setIsOpen(false), [setIsOpen]);
  const [isTyping, setIsTyping] = useState(false);
  const items = useMemo(
    () => (query ? filterOptions(options, query) : options),
    [query, options, filterOptions]
  );
  const menuRef = useRef<HTMLUListElement>(null);
  const inputRef = useRef<HTMLInputElement & HTMLTextAreaElement>(null);
  const onEnter = useCallback(
    (value?: T) => {
      if (isOpen && value) {
        setQuery(itemToString(value));
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
  useEffect(() => {
    if (query) setValue(items[activeIndex] || onNewItem(query));
  }, [setValue, activeIndex, items, onNewItem, query]);
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
          {items.map((t, i) => {
            const sharedProps = {
              onClick: () => {
                setIsTyping(false);
                setValue(t);
                setQuery(itemToString(t));
                inputRef.current?.focus();
              },
              active: activeIndex === i,
            };
            return renderItem ? (
              <React.Fragment key={i}>
                {renderItem?.({
                  item: t,
                  ...sharedProps,
                })}
              </React.Fragment>
            ) : (
              <MenuItem
                text={itemToString(t)}
                key={i}
                multiline
                {...sharedProps}
              />
            );
          })}
        </Menu>
      }
      target={
        <Input
          value={query}
          onChange={(e) => {
            setIsTyping(true);
            setQuery(e.target.value);
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
          id={id}
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
                rightElement: (
                  <Button icon={"add"} minimal onClick={() => onEnter()} />
                ),
              }
            : {})}
        />
      }
    />
  );
};

export default AutocompleteInput;
