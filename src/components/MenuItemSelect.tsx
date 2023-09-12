import { Button, IButtonProps, MenuItem } from "@blueprintjs/core";
import { SelectProps, Select } from "@blueprintjs/select";
import React, { ReactText } from "react";

const MenuItemSelect = <T extends ReactText>(
  props: Omit<SelectProps<T>, "itemRenderer"> & {
    ButtonProps?: IButtonProps & React.ButtonHTMLAttributes<HTMLButtonElement>;
  } & { emptyValueText?: string; transformItem?: (s: T) => React.ReactNode }
): JSX.Element => {
  const TypeSelect = Select.ofType<T>();
  const itemPredicate = (query: string, item: T) => {
    const text = props.transformItem ? props.transformItem(item) : item;
    return String(text).toLowerCase().includes(query.toLowerCase());
  };
  const { activeItem, ...selectProps } = props;
  return (
    <TypeSelect
      {...selectProps}
      itemRenderer={(item, { modifiers, handleClick }) => (
        <MenuItem
          key={item}
          text={props.transformItem ? props.transformItem(item) : item}
          active={modifiers.active}
          onClick={handleClick}
        />
      )}
      filterable={props.filterable}
      itemPredicate={props.filterable ? itemPredicate : undefined}
      popoverProps={{
        minimal: true,
        captureDismiss: true,
        ...props.popoverProps,
      }}
    >
      <Button
        text={
          activeItem ? (
            props.transformItem ? (
              props.transformItem(activeItem as T)
            ) : (
              activeItem
            )
          ) : (
            <i style={{ opacity: 0.5 }}>
              {props.emptyValueText || "Choose..."}
            </i>
          )
        }
        rightIcon="double-caret-vertical"
        {...props.ButtonProps}
      />
    </TypeSelect>
  );
};

export default MenuItemSelect;
