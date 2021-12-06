import { Menu, MenuItem, Popover, Position } from "@blueprintjs/core";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import ReactDOM from "react-dom";
import fuzzy from "fuzzy";
import { getUids } from "../dom";
import { updateBlock } from "../writes";

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
      t.scrollTop -
      9,
    left: windowLeft + span.offsetLeft + parseInt(computed.borderLeftWidth) - 1,
  };
  document.body.removeChild(div);
  return coordinates;
};

type Props<T> = {
  textarea: HTMLTextAreaElement;
  onItemSelect: (item: { text: string; id: string } & T) => void;
  initialItems: ({ text: string; id: string } & T)[];
};

const VALID_FILTER = /^[\w\d\s_-]$/;

const CursorMenu = <T extends Record<string, string>>({
  textarea,
  onClose,
  onItemSelect,
  initialItems,
}: {
  onClose: () => void;
} & Props<T>): React.ReactElement => {
  const itemsById = useMemo(
    () => Object.fromEntries(initialItems.map((item) => [item.id, item])),
    [initialItems]
  );
  const menuRef = useRef<HTMLUListElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [filter, setFilter] = useState("");
  const onPopoverClose = useCallback(() => {
    if (menuRef.current) {
      const value = menuRef.current.getAttribute("data-filter");
      const text = `${textarea.value.substring(
        0,
        textarea.selectionStart
      )}${value}${textarea.value.substring(textarea.selectionStart)}`;
      updateBlock({ uid: getUids(textarea).blockUid, text });
      setTimeout(() => {
        textarea.setSelectionRange(
          textarea.selectionStart + text.length,
          textarea.selectionEnd + text.length
        );
        onClose();
      }, 1);
    }
  }, [onClose, textarea, menuRef]);
  const items = useMemo(
    () =>
      (filter
        ? fuzzy
            .filter(filter, initialItems, {
              extract: (s) => s.text,
              pre: "<b>",
              post: "</b>",
            })
            .map((r) => ({ ...r.original, displayName: r.string }))
        : initialItems.map((r) => ({ ...r, displayName: r.text }))
      ).slice(0, 10),
    [filter, initialItems]
  );
  const onSelect = useCallback(
    (item) => {
      if (menuRef.current) {
        onItemSelect(item);
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
        const id =
          menuRef.current.children[index]
            .querySelector(".bp3-menu-item")
            ?.getAttribute("data-id") || "";
        onSelect(itemsById[id]);
      } else if (menuRef.current && VALID_FILTER.test(e.key)) {
        const value = menuRef.current.getAttribute("data-filter");
        setFilter(`${value}${e.key}`);
      } else if (menuRef.current && e.key === "Backspace") {
        const value = menuRef.current.getAttribute("data-filter");
        if (value) {
          setFilter(value.slice(0, -1));
        } else {
          onClose();
          return;
        }
      } else if (e.key !== "Shift") {
        onPopoverClose();
        return;
      }
      e.stopPropagation();
      e.preventDefault();
    },
    [menuRef, setActiveIndex, onClose, onPopoverClose]
  );
  useEffect(() => {
    textarea.addEventListener("keydown", keydownListener);
    return () => {
      textarea.removeEventListener("keydown", keydownListener);
    };
  }, [keydownListener]);
  return (
    <Popover
      onClose={onPopoverClose}
      isOpen={true}
      canEscapeKeyClose
      minimal
      target={<span />}
      position={Position.BOTTOM_LEFT}
      modifiers={{
        flip: { enabled: false },
        preventOverflow: { enabled: false },
      }}
      content={
        <Menu
          ulRef={menuRef}
          data-active-index={activeIndex}
          data-filter={filter}
          style={{ width: 300 }}
        >
          {items.length ? (
            items.map(({ id, displayName }, i) => {
              return (
                <MenuItem
                  key={id}
                  data-id={id}
                  text={displayName
                    .split(/<b>(.*?)<\/b>/)
                    .map((part, i) =>
                      i % 2 === 1 ? (
                        <b key={i}>{part}</b>
                      ) : (
                        <span key={i}>{part}</span>
                      )
                    )}
                  active={i === activeIndex}
                  onMouseEnter={() => setActiveIndex(i)}
                  onClick={() => onSelect(itemsById[id])}
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

export const render = <T extends Record<string, string>>(
  props: Props<T>
): void => {
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
