import { Menu, MenuItem, Popover, Position } from "@blueprintjs/core";
import React, { useCallback, useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";

// inspired by https://github.com/zurb/tribute/blob/master/src/TributeRange.js#L446-L556
export const getCoordsFromTextarea = (
  t: HTMLTextAreaElement
): { top: number; left: number } => {
  const properties = [
    "direction",
    "boxSizing",
    "width",
    "height",
    "overflowX",
    "overflowY",
    "borderTopWidth",
    "borderRightWidth",
    "borderBottomWidth",
    "borderLeftWidth",
    "paddingTop",
    "paddingRight",
    "paddingBottom",
    "paddingLeft",
    "fontStyle",
    "fontVariant",
    "fontWeight",
    "fontStretch",
    "fontSize",
    "fontSizeAdjust",
    "lineHeight",
    "fontFamily",
    "textAlign",
    "textTransform",
    "textIndent",
    "textDecoration",
    "letterSpacing",
    "wordSpacing",
  ] as const;

  const div = document.createElement("div");
  div.id = "input-textarea-caret-position-mirror-div";
  document.body.appendChild(div);

  const style = div.style;
  const computed = getComputedStyle(t);

  style.whiteSpace = "pre-wrap";
  style.wordWrap = "break-word";

  // position off-screen
  style.position = "absolute";
  style.visibility = "hidden";
  style.overflow = "hidden";

  // transfer the element's properties to the div
  properties.forEach((prop) => {
    style[prop] = computed[prop];
  });

  div.textContent = t.value.substring(0, t.selectionStart);

  const span = document.createElement("span");
  span.textContent = t.value.substring(t.selectionStart) || ".";
  div.appendChild(span);

  const doc = document.documentElement;
  const windowLeft =
    (window.pageXOffset || doc.scrollLeft) - (doc.clientLeft || 0);
  const windowTop =
    (window.pageYOffset || doc.scrollTop) - (doc.clientTop || 0);

  const coordinates = {
    top:
      windowTop +
      span.offsetTop +
      parseInt(computed.borderTopWidth) +
      parseInt(computed.fontSize) -
      t.scrollTop,
    left: windowLeft + span.offsetLeft + parseInt(computed.borderLeftWidth),
  };
  document.body.removeChild(div);
  return coordinates;
};

type Props = {
  textarea: HTMLTextAreaElement;
  onItemSelect: (args: {
    index: number;
    menu: HTMLUListElement;
    textarea: HTMLTextAreaElement;
  }) => void;
};

const CursorMenu = ({
  textarea,
  onClose,
  onItemSelect,
}: {
  onClose: () => void;
} & Props): React.ReactElement => {
  const menuRef = useRef<HTMLUListElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [items] = useState<{ text: string; id: string }[]>([]);
  const onSelect = useCallback(
    (index) => {
      if (menuRef.current) {
        onItemSelect({ index, menu: menuRef.current, textarea });
        onClose();
      }
    },
    [menuRef, onClose, textarea, onItemSelect]
  );
  const keydownListener = useCallback(
    (e: KeyboardEvent) => {
      if (
        menuRef.current &&
        (e.key === "ArrowRight" || e.key === "ArrowDown")
      ) {
        const index = Number(menuRef.current.getAttribute("data-active-index"));
        const count = menuRef.current.childElementCount;
        setActiveIndex((index + 1) % count);
      } else if (
        menuRef.current &&
        (e.key === "ArrowLeft" || e.key === "ArrowUp")
      ) {
        const index = Number(menuRef.current.getAttribute("data-active-index"));
        const count = menuRef.current.childElementCount;
        setActiveIndex((index - 1 + count) % count);
      } else if (menuRef.current && e.key === "Enter") {
        const index = Number(menuRef.current.getAttribute("data-active-index"));
        onSelect(index);
      } else {
        onClose();
        return;
      }
      e.stopPropagation();
      e.preventDefault();
    },
    [menuRef, setActiveIndex, onClose]
  );
  useEffect(() => {
    textarea.addEventListener("keydown", keydownListener);
    return () => {
      textarea.removeEventListener("keydown", keydownListener);
    };
  }, [keydownListener]);
  return (
    <Popover
      onClose={onClose}
      isOpen={true}
      canEscapeKeyClose
      minimal
      target={<span />}
      position={Position.BOTTOM_RIGHT}
      content={
        <Menu
          ulRef={menuRef}
          data-active-index={activeIndex}
          style={{ width: 300 }}
        >
          {items.length ? (
            items.map(({ text, id }, i) => {
              return (
                <MenuItem
                  key={id}
                  data-uid={id}
                  text={text}
                  active={i === activeIndex}
                  onMouseEnter={() => setActiveIndex(i)}
                  onClick={() => onSelect(i)}
                />
              );
            })
          ) : (
            <MenuItem
              text={
                <span style={{ opacity: 0.75 }}>
                  <i>None</i>
                </span>
              }
              active={false}
              disabled={true}
            />
          )}
        </Menu>
      }
    />
  );
};

export const render = (props: Props): void => {
  const parent = document.createElement("span");
  const coords = getCoordsFromTextarea(props.textarea);
  parent.style.position = "absolute";
  parent.style.left = `${coords.left}px`;
  parent.style.top = `${coords.top}px`;
  props.textarea.parentElement?.insertBefore(parent, props.textarea);
  ReactDOM.render(
    <CursorMenu
      {...props}
      onClose={() => {
        ReactDOM.unmountComponentAtNode(parent);
        parent.remove();
      }}
    />,
    parent
  );
};

export default CursorMenu;
