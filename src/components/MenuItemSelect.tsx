import { Button, ButtonProps, MenuItem } from "@blueprintjs/core";
import {
  SelectProps,
  Select,
  ICreateNewItem,
  isCreateNewItem,
} from "@blueprintjs/select";
import React, { ReactText, ButtonHTMLAttributes, ReactNode } from "react";

type ActiveItem<T> = T | ICreateNewItem | null | undefined;
type TransformItem<T> = (s: T) => ReactNode;
type MenuItemSelectProps<T extends ReactText> = Omit<
  SelectProps<T>,
  "itemRenderer"
> & {
  ButtonProps?: ButtonProps & ButtonHTMLAttributes<HTMLButtonElement>;
  emptyValueText?: string;
  transformItem?: TransformItem<T>;
  children?: (props: {
    activeItem: ActiveItem<T>;
    emptyValueText?: string;
    transformItem?: TransformItem<T>;
  }) => ReactNode;
};

const MenuItemSelect = <T extends ReactText>(
  props: MenuItemSelectProps<T>
): JSX.Element => {
  const TypeSelect = Select.ofType<T>();
  const itemPredicate = (query: string, item: T) => {
    const text = props.transformItem ? props.transformItem(item) : item;
    return String(text).toLowerCase().includes(query.toLowerCase());
  };
  const {
    activeItem,
    filterable = false,
    children,
    transformItem,
    emptyValueText,
    ...selectProps
  } = props;

  const defaultButton = (
    <Button
      text={
        activeItem && !isCreateNewItem(activeItem) ? (
          transformItem ? (
            transformItem(activeItem as T)
          ) : (
            activeItem
          )
        ) : (
          <span className="opacity-50 italic">
            {emptyValueText || "Choose..."}
          </span>
        )
      }
      rightIcon="double-caret-vertical"
      {...props.ButtonProps}
    />
  );

  return (
    <TypeSelect
      {...selectProps}
      itemRenderer={(item, { modifiers, handleClick }) => (
        <MenuItem
          key={item}
          text={transformItem ? transformItem(item) : item}
          active={modifiers.active}
          onClick={handleClick}
        />
      )}
      filterable={filterable}
      itemPredicate={filterable ? itemPredicate : undefined}
      popoverProps={{
        minimal: true,
        captureDismiss: true,
        ...props.popoverProps,
      }}
    >
      {children
        ? children({
            activeItem,
            emptyValueText,
            transformItem,
          })
        : defaultButton}
    </TypeSelect>
  );
};

export default MenuItemSelect;
