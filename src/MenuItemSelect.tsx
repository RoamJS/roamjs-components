import { Button, IButtonProps, MenuItem } from "@blueprintjs/core";
import { SelectProps, Select } from "@blueprintjs/select";
import React, { ReactText } from "react";

const MenuItemSelect = <T extends ReactText>(
  props: Omit<SelectProps<T>, "itemRenderer"> & {
    ButtonProps?: IButtonProps & React.ButtonHTMLAttributes<HTMLButtonElement>;
  } & { emptyValueText?: string; transformItem?: (s: T) => T }
): JSX.Element => {
  const TypeSelect = Select.ofType<T>();
  return (
    <TypeSelect
      {...props}
      itemRenderer={(item, { modifiers, handleClick }) => (
        <MenuItem
          key={item}
          text={props.transformItem ? props.transformItem(item) : item}
          active={modifiers.active}
          onClick={handleClick}
        />
      )}
      filterable={false}
      popoverProps={{
        minimal: true,
        captureDismiss: true,
        ...props.popoverProps,
      }}
    >
      <Button
        text={
          props.activeItem ? (
            props.transformItem ? (
              props.transformItem(props.activeItem as T)
            ) : (
              props.activeItem
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
